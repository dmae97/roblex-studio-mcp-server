import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';

/**
 * Tool for creating and configuring physics systems in Roblex
 */
export const physicsSystem = {
  register: (server: McpServer) => {
    // Register physics setup tool
    server.tool(
      'create-physics-system',
      {
        // Input schema using Zod
        objectName: z.string().describe('Name of the physical object'),
        objectType: z.enum(['Part', 'MeshPart', 'Union', 'WedgePart', 'CornerWedgePart', 'TrussPart']).describe('Type of physical object'),
        size: z.object({
          x: z.number().default(4).describe('X dimension'),
          y: z.number().default(1).describe('Y dimension'),
          z: z.number().default(4).describe('Z dimension')
        }).describe('Size of the physical object'),
        position: z.object({
          x: z.number().default(0).describe('X position'),
          y: z.number().default(10).describe('Y position'),
          z: z.number().default(0).describe('Z position')
        }).describe('Position of the physical object'),
        material: z.enum([
          'Plastic', 'Wood', 'Slate', 'Concrete', 'CorrodedMetal',
          'DiamondPlate', 'Foil', 'Grass', 'Ice', 'Marble',
          'Granite', 'Brick', 'Pebble', 'Sand', 'Fabric',
          'SmoothPlastic', 'Metal', 'WoodPlanks', 'Cobblestone', 'Glass',
          'ForceField', 'Air', 'Water', 'Rock', 'Glacier',
          'Snow', 'Sandstone', 'Mud', 'Basalt', 'CrackedLava',
          'Neon', 'Asphalt'
        ]).default('Plastic').describe('Material of the physical object'),
        physicsProperties: z.object({
          density: z.number().min(0.01).max(100).default(1).describe('Density of the object (0.01 to 100)'),
          friction: z.number().min(0).max(1).default(0.3).describe('Friction coefficient (0 to 1)'),
          elasticity: z.number().min(0).max(1).default(0.5).describe('Elasticity/restitution (0 to 1)'),
          frictionWeight: z.number().min(0).max(100).default(1).describe('Friction weight (0 to 100)'),
          elasticityWeight: z.number().min(0).max(100).default(1).describe('Elasticity weight (0 to 100)')
        }).describe('Physics properties for the object'),
        collisionGroups: z.array(z.string()).optional().describe('Optional collision groups for this object'),
        moverProperties: z.object({
          isMover: z.boolean().default(false).describe('Whether this object acts as a mover/platform'),
          moveDistance: z.number().default(10).describe('Distance to move'),
          moveSpeed: z.number().default(5).describe('Speed of movement'),
          moveDirection: z.enum(['X', 'Y', 'Z']).default('Y').describe('Direction of movement'),
          moveType: z.enum(['Loop', 'PingPong', 'Once']).default('PingPong').describe('Type of movement pattern')
        }).optional().describe('Optional mover/platform properties'),
        constraints: z.array(z.object({
          type: z.enum(['Hinge', 'Rope', 'Spring', 'Weld', 'Motor', 'Rod', 'Prismatic', 'Cylindrical', 'BallInSocket', 'Universal']).describe('Type of constraint'),
          attachTo: z.string().describe('Name of the part to attach to'),
          attachmentName: z.string().optional().describe('Optional name for the attachment'),
          limits: z.object({
            lowerLimit: z.number().default(-45).describe('Lower limit (in degrees for rotational constraints)'),
            upperLimit: z.number().default(45).describe('Upper limit (in degrees for rotational constraints)')
          }).optional().describe('Optional constraint limits'),
          properties: z.record(z.any()).optional().describe('Additional properties specific to this constraint type')
        })).optional().describe('Optional constraints to attach to other objects')
      },
      async ({ objectName, objectType, size, position, material, physicsProperties, collisionGroups, moverProperties, constraints }) => {
        logger.info(`Creating physics system for ${objectName} of type ${objectType}`);
        
        try {
          // Generate Lua code for the physics system
          let code = `-- Physics System for ${objectName}
-- Generated using Roblex MCP Server

-- Services
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local PhysicsService = game:GetService("PhysicsService")
local RunService = game:GetService("RunService")

-- Create the ${objectType}
local ${objectName} = Instance.new("${objectType}")
${objectName}.Name = "${objectName}"
${objectName}.Size = Vector3.new(${size.x}, ${size.y}, ${size.z})
${objectName}.Position = Vector3.new(${position.x}, ${position.y}, ${position.z})
${objectName}.Material = Enum.Material.${material}
${objectName}.Anchored = false
${objectName}.CanCollide = true

-- Set up physics properties
${objectName}.CustomPhysicalProperties = PhysicalProperties.new(
    ${physicsProperties.density}, -- Density
    ${physicsProperties.friction}, -- Friction
    ${physicsProperties.elasticity}, -- Elasticity/Restitution
    ${physicsProperties.frictionWeight}, -- FrictionWeight
    ${physicsProperties.elasticityWeight} -- ElasticityWeight
)

-- Parent the part to workspace
${objectName}.Parent = workspace
`;

          // Add collision groups if specified
          if (collisionGroups && collisionGroups.length > 0) {
            code += `
-- Set up collision groups
local function SetupCollisionGroups()
    -- Create collision groups if they don't exist
`;

            // Create all collision groups
            for (const group of collisionGroups) {
              code += `    pcall(function() PhysicsService:CreateCollisionGroup("${group}") end) -- pcall prevents errors if group already exists
`;
            }

            code += `
    -- Get collision group ID
    local objectGroupId = PhysicsService:GetCollisionGroupId("${collisionGroups[0]}")
    
    -- Assign part to collision group
    PhysicsService:SetPartCollisionGroup(${objectName}, "${collisionGroups[0]}")
    
    -- Set up collision rules between groups
`;

            // Set up collision rules between all specified groups
            for (let i = 0; i < collisionGroups.length; i++) {
              for (let j = i + 1; j < collisionGroups.length; j++) {
                code += `    PhysicsService:CollisionGroupSetCollidable("${collisionGroups[i]}", "${collisionGroups[j]}", true)
`;
              }
            }

            code += `end

-- Run the collision group setup
if RunService:IsServer() then
    SetupCollisionGroups()
end
`;
          }

          // Add mover functionality if specified
          if (moverProperties && moverProperties.isMover) {
            code += `
-- Set up mover/platform behavior
local function SetupMover()
    ${objectName}.Anchored = true -- Platforms are anchored
    
    local startPos = ${objectName}.Position
    local endPos = startPos + Vector3.new(
        ${moverProperties.moveDirection === 'X' ? `${moverProperties.moveDistance}, 0, 0` : '0'},
        ${moverProperties.moveDirection === 'Y' ? `${moverProperties.moveDistance}, 0, 0` : '0'},
        ${moverProperties.moveDirection === 'Z' ? `${moverProperties.moveDistance}, 0, 0` : '0'}
    )
    
    local moveIncrement = ${moverProperties.moveSpeed} / 100
    local currentPosition = 0
    local direction = 1
    
    local function UpdateMover()
        if "${moverProperties.moveType}" == "Loop" then
            currentPosition = (currentPosition + moveIncrement * direction) % 1
            
        elseif "${moverProperties.moveType}" == "PingPong" then
            currentPosition = currentPosition + moveIncrement * direction
            
            if currentPosition >= 1 then
                currentPosition = 1
                direction = -1
            elseif currentPosition <= 0 then
                currentPosition = 0
                direction = 1
            end
            
        elseif "${moverProperties.moveType}" == "Once" then
            if direction > 0 and currentPosition < 1 then
                currentPosition = math.min(currentPosition + moveIncrement, 1)
            elseif direction < 0 and currentPosition > 0 then
                currentPosition = math.max(currentPosition - moveIncrement, 0)
            end
        end
        
        ${objectName}.Position = startPos:Lerp(endPos, currentPosition)
    end
    
    RunService.Heartbeat:Connect(UpdateMover)
end

-- Run the mover setup
if RunService:IsServer() then
    SetupMover()
end
`;
          }

          // Add constraints if specified
          if (constraints && constraints.length > 0) {
            code += `
-- Set up constraints
local function SetupConstraints()
`;

            // Create each constraint
            for (let i = 0; i < constraints.length; i++) {
              const constraint = constraints[i];
              
              code += `    -- Create ${constraint.type} constraint
    local constraint${i} = Instance.new("${constraint.type}Constraint")
    constraint${i}.Name = "${constraint.attachmentName || `${objectName}Constraint${i}`}"
    
    -- Create attachments for both parts
    local attachment0 = Instance.new("Attachment")
    attachment0.Name = "${constraint.attachmentName || `${objectName}Attachment${i}`}"
    attachment0.Parent = ${objectName}
    
    local attachment1 = Instance.new("Attachment")
    attachment1.Name = "${constraint.attachmentName || `${constraint.attachTo}Attachment${i}`}"
    attachment1.Parent = workspace:FindFirstChild("${constraint.attachTo}")
    
    -- Assign attachments to constraint
    constraint${i}.Attachment0 = attachment0
    constraint${i}.Attachment1 = attachment1
    
`;

              // Add type-specific constraint properties
              switch (constraint.type) {
                case 'Hinge':
                  code += `    -- Hinge properties
    ${constraint.limits ? `constraint${i}.LimitsEnabled = true
    constraint${i}.LowerAngle = ${constraint.limits.lowerLimit}
    constraint${i}.UpperAngle = ${constraint.limits.upperLimit}` : ''}
`;
                  break;
                  
                case 'Spring':
                  code += `    -- Spring properties
    constraint${i}.Stiffness = ${constraint.properties?.stiffness || 1000}
    constraint${i}.Damping = ${constraint.properties?.damping || 100}
    constraint${i}.FreeLength = ${constraint.properties?.freeLength || 5}
`;
                  break;
                  
                case 'Motor':
                  code += `    -- Motor properties
    constraint${i}.AngularVelocity = ${constraint.properties?.angularVelocity || 5}
    constraint${i}.MaxTorque = ${constraint.properties?.maxTorque || 1000}
`;
                  break;
                  
                case 'Rod':
                  code += `    -- Rod properties
    constraint${i}.Length = ${constraint.properties?.length || 5}
`;
                  break;
                  
                case 'Rope':
                  code += `    -- Rope properties
    constraint${i}.Length = ${constraint.properties?.length || 5}
    constraint${i}.Restitution = ${constraint.properties?.restitution || 0}
`;
                  break;
              }
              
              code += `    -- Parent constraint to primary part
    constraint${i}.Parent = ${objectName}
    
`;
            }
            
            code += `end

-- Run the constraint setup
if RunService:IsServer() then
    SetupConstraints()
end
`;
          }

          // Add utility functions for interacting with the physics object
          code += `
-- Utility functions for working with this physical object
local PhysicsUtils = {}

-- Apply an impulse to the object
function PhysicsUtils.ApplyImpulse(force, position)
    if not ${objectName}.Anchored then
        ${objectName}:ApplyImpulse(force or Vector3.new(0, 10, 0), position)
    end
end

-- Apply angular impulse to the object
function PhysicsUtils.ApplyAngularImpulse(torque)
    if not ${objectName}.Anchored then
        ${objectName}:ApplyAngularImpulse(torque or Vector3.new(0, 10, 0))
    end
end

-- Set velocity directly
function PhysicsUtils.SetVelocity(velocity)
    if not ${objectName}.Anchored then
        ${objectName}.AssemblyLinearVelocity = velocity or Vector3.new(0, 10, 0)
    end
end

-- Set angular velocity directly
function PhysicsUtils.SetAngularVelocity(angularVelocity)
    if not ${objectName}.Anchored then
        ${objectName}.AssemblyAngularVelocity = angularVelocity or Vector3.new(0, 1, 0)
    end
end

-- Toggle anchored state
function PhysicsUtils.ToggleAnchored()
    ${objectName}.Anchored = not ${objectName}.Anchored
    return ${objectName}.Anchored
end

-- Add to ReplicatedStorage for reference
local utils = Instance.new("ModuleScript")
utils.Name = "${objectName}PhysicsUtils"
utils.Source = "return " .. require(game:GetService('HttpService')):JSONEncode(PhysicsUtils)
utils.Parent = ReplicatedStorage

-- Return the created object for further use in scripts
return ${objectName}
`;

          return {
            content: [
              { 
                type: 'text', 
                text: code 
              }
            ]
          };
        } catch (error) {
          logger.error('Error creating physics system:', { message: error instanceof Error ? error.message : String(error) });
          return {
            content: [
              { 
                type: 'text', 
                text: `Error creating physics system: ${error instanceof Error ? error.message : String(error)}` 
              }
            ],
            isError: true
          };
        }
      }
    );
    
    // Register collision group management tool
    server.tool(
      'setup-collision-groups',
      {
        // Input schema using Zod
        collisionGroups: z.array(z.object({
          name: z.string().describe('Name of the collision group'),
          description: z.string().optional().describe('Optional description of what this group is for')
        })).describe('Array of collision groups to create'),
        collisionRules: z.array(z.object({
          group1: z.string().describe('First collision group'),
          group2: z.string().describe('Second collision group'),
          canCollide: z.boolean().default(true).describe('Whether these groups can collide with each other')
        })).describe('Rules defining which groups can collide with each other')
      },
      async ({ collisionGroups, collisionRules }) => {
        logger.info(`Setting up ${collisionGroups.length} collision groups with ${collisionRules.length} rules`);
        
        try {
          // Generate Lua code for collision group management
          const code = `-- Collision Group Management System
-- Generated using Roblex MCP Server

-- Services
local PhysicsService = game:GetService("PhysicsService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Create a module to track and manage collision groups
local CollisionManager = {}

-- Collision groups defined in this system
CollisionManager.Groups = {
${collisionGroups.map(group => `    ["${group.name}"] = {
        Description = "${group.description || 'No description provided'}"
    }`).join(',\n')}
}

-- Initialize all collision groups
function CollisionManager.Initialize()
    -- Create all defined collision groups
    for groupName, _ in pairs(CollisionManager.Groups) do
        -- Use pcall to prevent errors if group already exists
        pcall(function()
            PhysicsService:CreateCollisionGroup(groupName)
            print("Created collision group: " .. groupName)
        end)
    end
    
    -- Set up collision rules
${collisionRules.map(rule => `    PhysicsService:CollisionGroupSetCollidable("${rule.group1}", "${rule.group2}", ${rule.canCollide})
    print("Set collision rule: ${rule.group1} ${rule.canCollide ? 'can' : 'cannot'} collide with ${rule.group2}")`).join('\n')}
end

-- Assign a part to a collision group
function CollisionManager.AssignPart(part, groupName)
    if not CollisionManager.Groups[groupName] then
        warn("Collision group '" .. groupName .. "' does not exist")
        return false
    end
    
    PhysicsService:SetPartCollisionGroup(part, groupName)
    return true
end

-- Assign all descendants of a model to a collision group
function CollisionManager.AssignModel(model, groupName)
    if not CollisionManager.Groups[groupName] then
        warn("Collision group '" .. groupName .. "' does not exist")
        return false
    end
    
    local success = true
    for _, descendant in ipairs(model:GetDescendants()) do
        if descendant:IsA("BasePart") then
            PhysicsService:SetPartCollisionGroup(descendant, groupName)
        end
    end
    
    return success
end

-- Get collision group of a part
function CollisionManager.GetPartGroup(part)
    return PhysicsService:GetPartCollisionGroup(part)
end

-- Get all parts in a collision group
function CollisionManager.GetPartsInGroup(groupName)
    local parts = {}
    
    for _, descendant in ipairs(workspace:GetDescendants()) do
        if descendant:IsA("BasePart") and PhysicsService:GetPartCollisionGroup(descendant) == groupName then
            table.insert(parts, descendant)
        end
    end
    
    return parts
end

-- Create and save the module
local module = Instance.new("ModuleScript")
module.Name = "CollisionManager"
module.Source = "return " .. require(game:GetService('HttpService')):JSONEncode(CollisionManager)
module.Parent = ReplicatedStorage

-- Initialize collision groups
CollisionManager.Initialize()

-- Return the manager for use in other scripts
return CollisionManager
`;

          return {
            content: [
              { 
                type: 'text', 
                text: code 
              }
            ]
          };
        } catch (error) {
          logger.error('Error setting up collision groups:', { message: error instanceof Error ? error.message : String(error) });
          return {
            content: [
              { 
                type: 'text', 
                text: `Error setting up collision groups: ${error instanceof Error ? error.message : String(error)}` 
              }
            ],
            isError: true
          };
        }
      }
    );
    
    logger.debug('Physics system tools registered');
  }
};
