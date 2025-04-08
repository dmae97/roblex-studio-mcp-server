import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { NotFoundError, DatastoreError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

// Define the structure for template categories and templates
interface Template {
  id: string;
  name: string;
  description: string;
  uri: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  templates: Template[];
}

// Mock template data (replace with actual data source if needed)
const templateData: { categories: TemplateCategory[] } = {
  categories: [
    {
      id: 'game',
      name: 'Game Templates',
      templates: [
        {
          id: 'platformer',
          name: 'Platformer Game',
          description: 'A basic 2D platformer game template with platforms and character controls',
          uri: 'template://roblex/game/platformer'
        },
        {
          id: 'rpg',
          name: 'RPG Game',
          description: 'A basic RPG game template with character stats, inventory, and NPCs',
          uri: 'template://roblex/game/rpg'
        },
        {
          id: 'basic',
          name: 'Basic Game',
          description: 'A minimal game template with basic player setup',
          uri: 'template://roblex/game/basic'
        }
      ]
    },
    {
      id: 'script',
      name: 'Script Templates',
      templates: [
        {
          id: 'character-controller',
          name: 'Character Controller',
          description: 'A customizable character controller with advanced movement features',
          uri: 'template://roblex/script/character-controller'
        },
        {
          id: 'inventory-system',
          name: 'Inventory System',
          description: 'A complete inventory system with item management and UI',
          uri: 'template://roblex/script/inventory-system'
        },
        {
          id: 'basic',
          name: 'Basic Script',
          description: 'A minimal script template with common setup patterns',
          uri: 'template://roblex/script/basic'
        }
      ]
    }
  ]
};

/**
 * Template resources for Roblex Studio
 */
export const templates = {
  register: (server: McpServer) => {
    logger.info('Registering template resources...');
    try {
      // Register template resource with integrated listing
      (server as any).resource(
        'code-templates',
        // ResourceTemplate now includes the list callback in its options
        new ResourceTemplate('template://roblex/{category}/{name}', {
          list: async () => {
            logger.info('Listing all Roblex templates via ResourceTemplate list callback');
            try {
              // Flatten the template data into the Resource structure
              const allTemplates = templateData.categories.flatMap(category =>
                category.templates.map(template => ({
                  uri: template.uri,
                  name: `${category.name} - ${template.name}`, // Informative name
                  description: template.description
                  // mimeType is usually not needed for listing resources
                }))
              );
              return { resources: allTemplates };
            } catch (error) {
               const errorMessage: string = error instanceof Error ? error.message : String(error);
               logger.error('Error listing templates', { error: errorMessage });
               return { resources: [], error: new DatastoreError(`Failed to list templates: ${errorMessage}`) };
            }
          }
        }),
        // Read callback for individual templates
        async (uri: any, variables: any) => {
          // Handle potential array values if necessary, though unlikely for this template
          const category = typeof variables.category === 'string' ? variables.category : variables.category?.[0] ?? '';
          const name = typeof variables.name === 'string' ? variables.name : variables.name?.[0] ?? '';

          logger.info(`Fetching template: ${category}/${name}`);

          try {
            let content = '';
            if (category === 'game') {
              switch (name) {
                case 'platformer':
                  content = `-- Roblex Platformer Game Template
-- A basic 2D platformer game template for Roblex Studio

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

-- Constants
local JUMP_POWER = 50
local MOVE_SPEED = 16
local GRAVITY = 0.5

-- Player setup
local function setupPlayer(player)
    local character = player.Character or player.CharacterAdded:Wait()
    local humanoid = character:WaitForChild("Humanoid")
    local rootPart = character:WaitForChild("HumanoidRootPart")
    
    -- Configure character
    humanoid.JumpPower = JUMP_POWER
    humanoid.WalkSpeed = MOVE_SPEED
    
    -- Set up controls
    local function onJump()
        humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
    end
    
    -- Connect events
    humanoid.Jumping:Connect(function()
        print("Player jumped!")
    end)
    
    humanoid.Died:Connect(function()
        print("Player died! Respawning...")
        wait(3)
        player:LoadCharacter()
    end)
end

-- Set up each player
Players.PlayerAdded:Connect(setupPlayer)
for _, player in pairs(Players:GetPlayers()) do
    task.spawn(function()
        setupPlayer(player)
    end)
end

-- Create platforms
local function createPlatform(position, size)
    local platform = Instance.new("Part")
    platform.Name = "Platform"
    platform.Size = size
    platform.Position = position
    platform.Anchored = true
    platform.Material = Enum.Material.Wood
    platform.BrickColor = BrickColor.new("Bright green")
    platform.Parent = workspace
    
    return platform
end

-- Create some sample platforms
createPlatform(Vector3.new(0, 0, 0), Vector3.new(20, 1, 20))
createPlatform(Vector3.new(15, 3, 0), Vector3.new(10, 1, 5))
createPlatform(Vector3.new(-10, 6, 5), Vector3.new(8, 1, 8))
createPlatform(Vector3.new(5, 9, -8), Vector3.new(5, 1, 5))

print("Platformer template initialized!")
`;
                  break;
                
                case 'rpg':
                  content = `-- Roblex RPG Game Template
-- A basic RPG game template for Roblex Studio

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

-- Data structures
local PlayerData = {}

-- Constants
local START_HEALTH = 100
local START_LEVEL = 1
local START_GOLD = 50

-- Item database (would typically be stored in a ModuleScript)
local Items = {
    Sword = {
        Name = "Basic Sword",
        Damage = 10,
        Value = 25
    },
    Potion = {
        Name = "Health Potion",
        Heal = 20,
        Value = 10
    },
    Shield = {
        Name = "Wooden Shield",
        Defense = 5,
        Value = 15
    }
}

-- Player setup
local function setupPlayer(player)
    -- Initialize player data
    PlayerData[player.UserId] = {
        Health = START_HEALTH,
        MaxHealth = START_HEALTH,
        Level = START_LEVEL,
        Experience = 0,
        Gold = START_GOLD,
        Inventory = {
            {ItemId = "Sword", Quantity = 1},
            {ItemId = "Potion", Quantity = 3}
        }
    }
    
    -- Create folder for player-specific instances
    local playerFolder = Instance.new("Folder")
    playerFolder.Name = player.Name
    playerFolder.Parent = ServerStorage
    
    -- Setup character
    local character = player.Character or player.CharacterAdded:Wait()
    local humanoid = character:WaitForChild("Humanoid")
    
    -- Add character stats
    local stats = Instance.new("IntValue")
    stats.Name = "Stats"
    stats.Parent = character
    
    local health = Instance.new("IntValue")
    health.Name = "Health"
    health.Value = START_HEALTH
    health.Parent = stats
    
    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = START_LEVEL
    level.Parent = stats
    
    -- Set up UI (in a real game, this would be more extensive)
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "RPGUI"
    screenGui.Parent = player.PlayerGui
    
    print("Player " .. player.Name .. " initialized!")
end

-- Handle player leaving
local function playerLeaving(player)
    -- Save player data (in a real game, this would save to a database)
    print("Saving data for player: " .. player.Name)
    PlayerData[player.UserId] = nil
end

-- Set up each player
Players.PlayerAdded:Connect(setupPlayer)
Players.PlayerRemoving:Connect(playerLeaving)

-- Initialize existing players
for _, player in pairs(Players:GetPlayers()) do
    task.spawn(function()
        setupPlayer(player)
    end)
end

-- Create an NPC
local function createNPC(position, name)
    local npc = Instance.new("Model")
    npc.Name = name
    
    local torso = Instance.new("Part")
    torso.Name = "Torso"
    torso.Size = Vector3.new(2, 2, 1)
    torso.Position = position
    torso.BrickColor = BrickColor.new("Bright blue")
    torso.Anchored = true
    torso.Parent = npc
    
    local head = Instance.new("Part")
    head.Name = "Head"
    head.Shape = Enum.PartType.Ball
    head.Size = Vector3.new(1.2, 1.2, 1.2)
    head.Position = position + Vector3.new(0, 1.6, 0)
    head.BrickColor = BrickColor.new("Light yellow")
    head.Anchored = true
    head.Parent = npc
    
    local nameTag = Instance.new("BillboardGui")
    nameTag.Name = "NameTag"
    nameTag.Size = UDim2.new(0, 200, 0, 50)
    nameTag.StudsOffset = Vector3.new(0, 3, 0)
    nameTag.Adornee = head
    nameTag.Parent = npc
    
    local nameLabel = Instance.new("TextLabel")
    nameLabel.Name = "NameLabel"
    nameLabel.Size = UDim2.new(1, 0, 1, 0)
    nameLabel.BackgroundTransparency = 1
    nameLabel.TextScaled = true
    nameLabel.FontFace = Font.new("Arial", Enum.FontWeight.Bold)
    nameLabel.TextColor3 = Color3.new(1, 1, 1)
    nameLabel.Text = name
    nameLabel.Parent = nameTag
    
    -- Add clickable functionality
    local clickDetector = Instance.new("ClickDetector")
    clickDetector.Parent = torso
    clickDetector.MouseClick:Connect(function(player)
        print(name .. ": Hello, " .. player.Name .. "! Welcome to our RPG world!")
    end)
    
    npc.Parent = workspace
    return npc
end

-- Create some NPCs
createNPC(Vector3.new(5, 0.5, 5), "Shopkeeper")
createNPC(Vector3.new(-5, 0.5, 8), "Quest Giver")

print("RPG template initialized!")
`;
                  break;
                
                default:
                  content = `-- Basic Roblex Game Template
-- A simple starting point for a Roblex game

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Constants
local RESPAWN_TIME = 5

-- Player setup
local function setupPlayer(player)
    print("Setting up player: " .. player.Name)
    
    -- Wait for character to load
    local character = player.Character or player.CharacterAdded:Wait()
    
    -- Handle character events
    character:WaitForChild("Humanoid").Died:Connect(function()
        print(player.Name .. " has died!")
        wait(RESPAWN_TIME)
        player:LoadCharacter()
    end)
end

-- Connect player events
Players.PlayerAdded:Connect(function(player)
    print("Player joined: " .. player.Name)
    setupPlayer(player)
    
    -- Welcome message
    local message = Instance.new("Message")
    message.Text = "Welcome to the game, " .. player.Name .. "!"
    message.Parent = player.PlayerGui
    wait(5)
    message:Destroy()
end)

Players.PlayerRemoving:Connect(function(player)
    print("Player left: " .. player.Name)
    -- Clean up any player-specific resources here
end)

-- Initialize existing players
for _, player in pairs(Players:GetPlayers()) do
    task.spawn(function()
        setupPlayer(player)
    end)
end

print("Game template initialized!")
`;
              }
            } else if (category === 'script') {
              switch (name) {
                case 'character-controller':
                  content = `-- Roblex Character Controller Template
-- A customizable character controller for Roblex games

-- Services
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")

-- Get local player and character
local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local rootPart = character:WaitForChild("HumanoidRootPart")

-- Configuration
local SETTINGS = {
    CameraMode = "Default", -- Default, FirstPerson, Custom
    JumpHeight = 50,
    WalkSpeed = 16,
    SprintSpeed = 24,
    DoubleJumpEnabled = true,
    DashEnabled = true,
    DashCooldown = 2, -- seconds
    DashPower = 50
}

-- Variables
local isSprinting = false
local canDoubleJump = false
local canDash = true
local jumpCount = 0
local lastDashTime = 0

-- Initialize character
local function initCharacter()
    humanoid.JumpHeight = SETTINGS.JumpHeight
    humanoid.WalkSpeed = SETTINGS.WalkSpeed
    
    -- Reset variables
    isSprinting = false
    canDoubleJump = false
    canDash = true
    jumpCount = 0
    
    -- Set up camera if needed
    if SETTINGS.CameraMode == "FirstPerson" then
        workspace.CurrentCamera.CameraType = Enum.CameraType.Custom
        workspace.CurrentCamera.CameraSubject = humanoid
        humanoid.CameraOffset = Vector3.new(0, 0.5, 0)
    end
end

-- Input handling
local function handleInput(input, gameProcessed)
    if gameProcessed then return end
    
    if input.KeyCode == Enum.KeyCode.LeftShift then
        if input.UserInputState == Enum.UserInputState.Begin then
            isSprinting = true
            humanoid.WalkSpeed = SETTINGS.SprintSpeed
        else
            isSprinting = false
            humanoid.WalkSpeed = SETTINGS.WalkSpeed
        end
    elseif input.KeyCode == Enum.KeyCode.Space then
        if input.UserInputState == Enum.UserInputState.Begin then
            if jumpCount == 0 then
                jumpCount = 1
                canDoubleJump = SETTINGS.DoubleJumpEnabled
            elseif canDoubleJump then
                canDoubleJump = false
                jumpCount = 2
                -- Perform double jump
                humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
            end
        end
    elseif input.KeyCode == Enum.KeyCode.Q and SETTINGS.DashEnabled then
        if input.UserInputState == Enum.UserInputState.Begin and canDash then
            -- Perform dash
            local currentTime = tick()
            if currentTime - lastDashTime >= SETTINGS.DashCooldown then
                lastDashTime = currentTime
                canDash = false
                
                local lookVector = rootPart.CFrame.LookVector
                rootPart.Velocity = lookVector * SETTINGS.DashPower
                
                -- Visual effect for dash
                local dashEffect = Instance.new("Part")
                dashEffect.Shape = Enum.PartType.Ball
                dashEffect.Material = Enum.Material.Neon
                dashEffect.Size = Vector3.new(1, 1, 1)
                dashEffect.CFrame = rootPart.CFrame
                dashEffect.Anchored = true
                dashEffect.CanCollide = false
                dashEffect.Parent = workspace
                
                -- Clean up effect and reset dash
                task.delay(0.2, function()
                    dashEffect:Destroy()
                end)
                
                task.delay(SETTINGS.DashCooldown, function()
                    canDash = true
                end)
            end
        end
    end
end

-- State handling
local function onStateChanged(_, newState)
    if newState == Enum.HumanoidStateType.Landed then
        jumpCount = 0
        canDoubleJump = false
    elseif newState == Enum.HumanoidStateType.Freefall then
        if jumpCount == 0 then
            jumpCount = 1
        end
    end
end

-- Connect events
UserInputService.InputBegan:Connect(handleInput)
UserInputService.InputEnded:Connect(handleInput)
humanoid.StateChanged:Connect(onStateChanged)

-- Handle character respawning
player.CharacterAdded:Connect(function(newCharacter)
    character = newCharacter
    humanoid = character:WaitForChild("Humanoid")
    rootPart = character:WaitForChild("HumanoidRootPart")
    
    initCharacter()
    humanoid.StateChanged:Connect(onStateChanged)
end)

-- Initialize
initCharacter()

print("Character controller initialized!")
`;
                  break;
                
                case 'inventory-system':
                  content = `-- Roblex Inventory System Template
-- A customizable inventory system for Roblex games

-- Services
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- Create necessary folders and events
local Events = ReplicatedStorage:FindFirstChild("Events") or Instance.new("Folder")
Events.Name = "Events"
Events.Parent = ReplicatedStorage

local InventoryEvents = Events:FindFirstChild("InventoryEvents") or Instance.new("Folder")
InventoryEvents.Name = "InventoryEvents"
InventoryEvents.Parent = Events

-- Create remote events
local UpdateInventory = InventoryEvents:FindFirstChild("UpdateInventory") or Instance.new("RemoteEvent")
UpdateInventory.Name = "UpdateInventory"
UpdateInventory.Parent = InventoryEvents

local UseItem = InventoryEvents:FindFirstChild("UseItem") or Instance.new("RemoteEvent")
UseItem.Name = "UseItem"
UseItem.Parent = InventoryEvents

local DropItem = InventoryEvents:FindFirstChild("DropItem") or Instance.new("RemoteEvent")
DropItem.Name = "DropItem"
DropItem.Parent = InventoryEvents

-- Create item database
local ItemDatabase = {}

function ItemDatabase.GetItemData(itemId)
    -- This would typically be loaded from a ModuleScript
    local items = {
        ["sword"] = {
            Name = "Iron Sword",
            Description = "A basic sword for combat",
            Type = "Weapon",
            MaxStack = 1,
            Stats = {
                Damage = 10,
                Durability = 100
            },
            Icon = "rbxassetid://123456789",
            Model = "rbxassetid://987654321"
        },
        ["potion_health"] = {
            Name = "Health Potion",
            Description = "Restores 20 health points",
            Type = "Consumable",
            MaxStack = 10,
            Stats = {
                HealAmount = 20
            },
            Icon = "rbxassetid://234567890",
            Model = "rbxassetid://876543210"
        },
        ["gold"] = {
            Name = "Gold Coin",
            Description = "Currency used for trading",
            Type = "Currency",
            MaxStack = 999,
            Icon = "rbxassetid://345678901",
            Model = "rbxassetid://765432109"
        }
    }
    
    return items[itemId]
end

-- Player inventory manager
local InventoryManager = {}
local PlayerInventories = {}

function InventoryManager.CreateInventory(player, slots)
    if not PlayerInventories[player.UserId] then
        PlayerInventories[player.UserId] = {
            Slots = slots or 20,
            Items = {}
        }
        
        -- Initialize empty inventory
        for i = 1, PlayerInventories[player.UserId].Slots do
            PlayerInventories[player.UserId].Items[i] = nil
        end
    end
    
    return PlayerInventories[player.UserId]
end

function InventoryManager.AddItem(player, itemId, quantity)
    local inventory = PlayerInventories[player.UserId]
    if not inventory then return false, "Inventory not found" end
    
    local itemData = ItemDatabase.GetItemData(itemId)
    if not itemData then return false, "Item not found" end
    
    quantity = quantity or 1
    
    -- Check if we can stack the item with existing ones
    if itemData.MaxStack > 1 then
        for slot, item in pairs(inventory.Items) do
            if item and item.Id == itemId and item.Quantity < itemData.MaxStack then
                local spaceLeft = itemData.MaxStack - item.Quantity
                local amountToAdd = math.min(quantity, spaceLeft)
                
                inventory.Items[slot].Quantity = inventory.Items[slot].Quantity + amountToAdd
                quantity = quantity - amountToAdd
                
                if quantity <= 0 then
                    -- Notify client
                    UpdateInventory:FireClient(player, inventory.Items)
                    return true
                end
            end
        end
    end
    
    -- Find empty slots for remaining quantity
    while quantity > 0 do
        local emptySlot = nil
        
        for i = 1, inventory.Slots do
            if not inventory.Items[i] then
                emptySlot = i
                break
            end
        end
        
        if not emptySlot then
            -- Inventory is full
            UpdateInventory:FireClient(player, inventory.Items)
            return false, "Inventory full"
        end
        
        -- Add item to empty slot
        local amountToAdd = math.min(quantity, itemData.MaxStack)
        inventory.Items[emptySlot] = {
            Id = itemId,
            Quantity = amountToAdd,
            Data = {} -- Custom item data (e.g., durability, enchantments)
        }
        
        quantity = quantity - amountToAdd
    end
    
    -- Notify client
    UpdateInventory:FireClient(player, inventory.Items)
    return true
end

-- Server-side event handlers
UseItem.OnServerEvent:Connect(function(player, slot)
    local inventory = PlayerInventories[player.UserId]
    if not inventory or not inventory.Items[slot] then return end
    
    local item = inventory.Items[slot]
    local itemData = ItemDatabase.GetItemData(item.Id)
    
    if itemData.Type == "Consumable" then
        -- Handle consumable use
        if item.Id == "potion_health" then
            -- Heal the player
            local character = player.Character
            if character and character:FindFirstChild("Humanoid") then
                local humanoid = character.Humanoid
                humanoid.Health = math.min(humanoid.Health + itemData.Stats.HealAmount, humanoid.MaxHealth)
            end
        end
        
        -- Reduce quantity
        item.Quantity = item.Quantity - 1
        if item.Quantity <= 0 then
            inventory.Items[slot] = nil
        end
        
        -- Notify client
        UpdateInventory:FireClient(player, inventory.Items)
    end
end)

-- Initialize player inventories
Players.PlayerAdded:Connect(function(player)
    InventoryManager.CreateInventory(player, 24)
    
    -- Give starter items (for testing)
    InventoryManager.AddItem(player, "sword", 1)
    InventoryManager.AddItem(player, "potion_health", 5)
    InventoryManager.AddItem(player, "gold", 100)
end)

Players.PlayerRemoving:Connect(function(player)
    -- Save inventory (in a real game, this would save to a database)
    PlayerInventories[player.UserId] = nil
end)

print("Inventory system initialized!")
`;
                  break;
                
                default:
                  content = `-- Basic Roblex Script Template
-- A simple starting point for a Roblex script

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Variables
local isActive = false

-- Functions
local function initialize()
    print("Script initialized!")
    isActive = true
    
    -- Example of creating a part
    local part = Instance.new("Part")
    part.Name = "ScriptCreatedPart"
    part.Size = Vector3.new(4, 1, 4)
    part.Position = Vector3.new(0, 10, 0)
    part.Anchored = true
    part.BrickColor = BrickColor.new("Bright blue")
    part.Material = Enum.Material.Neon
    part.Parent = workspace
    
    -- Make it spin
    local spinningConnection = nil
    spinningConnection = game:GetService("RunService").Heartbeat:Connect(function(dt)
        if isActive then
            part.CFrame = part.CFrame * CFrame.Angles(0, math.rad(45) * dt, 0)
        else
            spinningConnection:Disconnect()
        end
    end)
    
    return part
end

local function cleanup()
    print("Script cleaning up!")
    isActive = false
    
    -- Find and remove any parts we created
    local part = workspace:FindFirstChild("ScriptCreatedPart")
    if part then
        part:Destroy()
    end
end

-- Example of connecting player events
Players.PlayerAdded:Connect(function(player)
    print("Player joined: " .. player.Name)
end)

-- Initialize the script
local createdPart = initialize()

-- Clean up when the script is destroyed
script.Destroying:Connect(cleanup)

-- Return any values needed by other scripts
return {
    IsActive = function() return isActive end,
    GetPart = function() return createdPart end
}
`;
              }
            } else {
              // Handle case where category is not 'game' or 'script'
              logger.warn(`Unknown template category requested: ${category}`);
              content = `-- Roblex Studio Template
-- Unknown template category: ${category}

print("Template category '${category}' with name '${name}' not found.")
print("Available categories: game, script")
`;
            }

            if (!content) {
               logger.warn(`Template not found: ${category}/${name}`);
               return { contents: [], error: new NotFoundError(`Template not found: ${category}/${name}`) };
            }

            // Define content part inline, letting TS infer type within the array
            const contentPart = {
               uri: uri.toString(),
               text: content,
               mimeType: 'text/plain'
            };
            return {
              contents: [contentPart]
            };
          } catch (error) {
            const errorMessage: string = error instanceof Error ? error.message : String(error);
            logger.error(`Error fetching template: ${category}/${name}`, { error: errorMessage });
            return { contents: [], error: new DatastoreError(`Error fetching template: ${errorMessage}`) };
          }
        }
      );

      logger.debug('Template resources registered successfully.');

    } catch (error) {
       const errorMessage: string = error instanceof Error ? error.message : String(error);
       logger.error('Failed to register template resources', { error: errorMessage });
    }
  }
};
