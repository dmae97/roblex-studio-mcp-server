-- Roblox Studio MCP Plugin
-- This plugin connects to the MCP server and provides a UI for interacting with it

local HttpService = game:GetService("HttpService")
local StudioService = game:GetService("StudioService")
local Selection = game:GetService("Selection")

-- Configuration
local Config = {
    ServerUrl = "http://localhost:3000", -- MCP server URL
    ApiEndpoint = "/studio/api", -- Studio API endpoint
    SessionId = nil, -- Will be generated on connection
    IsConnected = false,
    AutoReconnect = true,
    ReconnectInterval = 5, -- Seconds
    PingInterval = 30, -- Seconds
    DebugMode = true
}

-- UI elements
local PluginGui = nil
local ConnectionStatus = nil
local ModelsList = nil
local ScriptEditor = nil
local ActionButtons = nil

-- Plugin instance
local plugin = nil

-- Utility functions
local function log(message, messageType)
    messageType = messageType or "Info"
    
    if Config.DebugMode or messageType ~= "Debug" then
        print("[MCP Plugin] [" .. messageType .. "] " .. message)
    end
end

local function generateSessionId()
    -- Generate a random session ID
    local random = Random.new(tick())
    local chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    local sessionId = "studio_"
    
    for i = 1, 16 do
        local randomIndex = random:NextInteger(1, #chars)
        sessionId = sessionId .. string.sub(chars, randomIndex, randomIndex)
    end
    
    return sessionId
end

local function updateConnectionStatus()
    if ConnectionStatus then
        ConnectionStatus.Text = Config.IsConnected and "Connected" or "Disconnected"
        ConnectionStatus.TextColor3 = Config.IsConnected and Color3.fromRGB(0, 200, 0) or Color3.fromRGB(200, 0, 0)
    end
end

-- API functions
local function sendRequest(messageType, data)
    if not Config.IsConnected and messageType ~= "studio:ping" then
        log("Cannot send request: not connected", "Warning")
        return nil
    end
    
    local url = Config.ServerUrl .. Config.ApiEndpoint .. "?sessionId=" .. Config.SessionId
    
    local requestData = {
        messageType = messageType,
        data = data or {}
    }
    
    local success, response = pcall(function()
        local jsonData = HttpService:JSONEncode(requestData)
        local responseData = HttpService:PostAsync(url, jsonData, Enum.HttpContentType.ApplicationJson)
        return HttpService:JSONDecode(responseData)
    end)
    
    if success then
        log("Request successful: " .. messageType, "Debug")
        return response
    else
        log("Request failed: " .. messageType .. " - " .. tostring(response), "Error")
        
        if messageType ~= "studio:ping" then
            -- If ping fails, we don't want to disconnect
            Config.IsConnected = false
            updateConnectionStatus()
        end
        
        return nil
    end
end

local function connect()
    if Config.IsConnected then
        log("Already connected", "Warning")
        return
    end
    
    -- Generate a new session ID if we don't have one
    Config.SessionId = Config.SessionId or generateSessionId()
    
    log("Connecting with session ID: " .. Config.SessionId)
    
    -- Send a ping to check if the server is available
    local response = sendRequest("studio:ping", { timestamp = tick() })
    
    if response and response.pong then
        Config.IsConnected = true
        updateConnectionStatus()
        log("Connected to MCP server")
        
        -- Start ping interval
        spawn(function()
            while Config.IsConnected do
                wait(Config.PingInterval)
                
                local pingResponse = sendRequest("studio:ping", { timestamp = tick() })
                
                if not pingResponse or not pingResponse.pong then
                    log("Ping failed", "Warning")
                    Config.IsConnected = false
                    updateConnectionStatus()
                    
                    if Config.AutoReconnect then
                        log("Attempting to reconnect...", "Info")
                        wait(Config.ReconnectInterval)
                        connect()
                    end
                    
                    break
                end
            end
        end)
    else
        log("Failed to connect to MCP server", "Error")
    end
end

local function disconnect()
    if not Config.IsConnected then
        log("Already disconnected", "Warning")
        return
    end
    
    Config.IsConnected = false
    updateConnectionStatus()
    log("Disconnected from MCP server")
end

-- Model management functions
local function getModels()
    local response = sendRequest("studio:getModels", {})
    
    if response and response.models then
        log("Retrieved " .. #response.models .. " models")
        return response.models
    else
        log("Failed to retrieve models", "Error")
        return {}
    end
end

local function updateModelsList()
    if not ModelsList then return end
    
    ModelsList:ClearAllChildren()
    
    local models = getModels()
    
    for i, model in ipairs(models) do
        local modelButton = Instance.new("TextButton")
        modelButton.Name = model.name
        modelButton.Text = model.name
        modelButton.Size = UDim2.new(1, 0, 0, 30)
        modelButton.Position = UDim2.new(0, 0, 0, (i-1) * 35)
        modelButton.Parent = ModelsList
        
        modelButton.MouseButton1Click:Connect(function()
            -- Show model details
            log("Selected model: " .. model.name)
            
            if ScriptEditor then
                -- If it's a script model, load it into the editor
                if string.match(model.name, "^Script_") then
                    local scriptName = string.gsub(model.name, "^Script_", "")
                    local source = model.state.source or ""
                    
                    ScriptEditor.Text = source
                    ScriptEditor.Visible = true
                    
                    -- Add save button
                    local saveButton = Instance.new("TextButton")
                    saveButton.Name = "SaveButton"
                    saveButton.Text = "Save Script"
                    saveButton.Size = UDim2.new(0, 100, 0, 30)
                    saveButton.Position = UDim2.new(1, -110, 0, 10)
                    saveButton.Parent = ScriptEditor
                    
                    saveButton.MouseButton1Click:Connect(function()
                        -- Save script to server
                        local response = sendRequest("studio:saveScript", {
                            scriptName = scriptName,
                            source = ScriptEditor.Text
                        })
                        
                        if response and response.success then
                            log("Script saved: " .. scriptName)
                        else
                            log("Failed to save script: " .. scriptName, "Error")
                        end
                    end)
                end
            end
        end)
    end
end

-- UI creation
local function createPluginUI()
    -- Create plugin window
    PluginGui = plugin:CreateDockWidgetPluginGui(
        "MCPPluginGui", 
        DockWidgetPluginGuiInfo.new(
            Enum.InitialDockState.Float,
            false, -- Initial enabled state
            true,  -- Override enabled state
            600,   -- Width
            400,   -- Height
            150,   -- Min width
            150    -- Min height
        )
    )
    
    PluginGui.Title = "MCP Plugin"
    PluginGui.Name = "MCPPlugin"
    
    -- Create main frame
    local mainFrame = Instance.new("Frame")
    mainFrame.Name = "MainFrame"
    mainFrame.Size = UDim2.new(1, 0, 1, 0)
    mainFrame.BackgroundColor3 = Color3.fromRGB(240, 240, 240)
    mainFrame.Parent = PluginGui
    
    -- Create connection status
    ConnectionStatus = Instance.new("TextLabel")
    ConnectionStatus.Name = "ConnectionStatus"
    ConnectionStatus.Size = UDim2.new(0, 100, 0, 30)
    ConnectionStatus.Position = UDim2.new(0, 10, 0, 10)
    ConnectionStatus.Text = "Disconnected"
    ConnectionStatus.TextColor3 = Color3.fromRGB(200, 0, 0)
    ConnectionStatus.Parent = mainFrame
    
    -- Create connect/disconnect button
    local connectButton = Instance.new("TextButton")
    connectButton.Name = "ConnectButton"
    connectButton.Size = UDim2.new(0, 100, 0, 30)
    connectButton.Position = UDim2.new(0, 120, 0, 10)
    connectButton.Text = "Connect"
    connectButton.Parent = mainFrame
    
    connectButton.MouseButton1Click:Connect(function()
        if Config.IsConnected then
            disconnect()
            connectButton.Text = "Connect"
        else
            connect()
            connectButton.Text = "Disconnect"
        end
    end)
    
    -- Create refresh button
    local refreshButton = Instance.new("TextButton")
    refreshButton.Name = "RefreshButton"
    refreshButton.Size = UDim2.new(0, 100, 0, 30)
    refreshButton.Position = UDim2.new(0, 230, 0, 10)
    refreshButton.Text = "Refresh"
    refreshButton.Parent = mainFrame
    
    refreshButton.MouseButton1Click:Connect(function()
        updateModelsList()
    end)
    
    -- Create models list
    local modelsListLabel = Instance.new("TextLabel")
    modelsListLabel.Name = "ModelsListLabel"
    modelsListLabel.Size = UDim2.new(0, 200, 0, 30)
    modelsListLabel.Position = UDim2.new(0, 10, 0, 50)
    modelsListLabel.Text = "Models"
    modelsListLabel.Parent = mainFrame
    
    local modelsListFrame = Instance.new("Frame")
    modelsListFrame.Name = "ModelsListFrame"
    modelsListFrame.Size = UDim2.new(0, 200, 0.8, -60)
    modelsListFrame.Position = UDim2.new(0, 10, 0, 80)
    modelsListFrame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
    modelsListFrame.Parent = mainFrame
    
    local modelsScrollingFrame = Instance.new("ScrollingFrame")
    modelsScrollingFrame.Name = "ModelsScrollingFrame"
    modelsScrollingFrame.Size = UDim2.new(1, 0, 1, 0)
    modelsScrollingFrame.CanvasSize = UDim2.new(0, 0, 4, 0)
    modelsScrollingFrame.ScrollBarThickness = 10
    modelsScrollingFrame.Parent = modelsListFrame
    
    ModelsList = modelsScrollingFrame
    
    -- Create script editor
    ScriptEditor = Instance.new("TextBox")
    ScriptEditor.Name = "ScriptEditor"
    ScriptEditor.Size = UDim2.new(0.65, -20, 0.8, -60)
    ScriptEditor.Position = UDim2.new(0.35, 10, 0, 80)
    ScriptEditor.TextXAlignment = Enum.TextXAlignment.Left
    ScriptEditor.TextYAlignment = Enum.TextYAlignment.Top
    ScriptEditor.ClearTextOnFocus = false
    ScriptEditor.TextWrapped = false
    ScriptEditor.MultiLine = true
    ScriptEditor.BackgroundColor3 = Color3.fromRGB(240, 240, 240)
    ScriptEditor.Visible = false
    ScriptEditor.Parent = mainFrame
    
    -- Create action buttons
    ActionButtons = Instance.new("Frame")
    ActionButtons.Name = "ActionButtons"
    ActionButtons.Size = UDim2.new(1, -20, 0, 40)
    ActionButtons.Position = UDim2.new(0, 10, 1, -50)
    ActionButtons.BackgroundTransparency = 1
    ActionButtons.Parent = mainFrame
    
    -- Create create script button
    local createScriptButton = Instance.new("TextButton")
    createScriptButton.Name = "CreateScriptButton"
    createScriptButton.Size = UDim2.new(0, 120, 0, 30)
    createScriptButton.Position = UDim2.new(0, 0, 0, 0)
    createScriptButton.Text = "Create Script"
    createScriptButton.Parent = ActionButtons
    
    createScriptButton.MouseButton1Click:Connect(function()
        -- Show script creation dialog
        local scriptName = "NewScript" -- In a real plugin, you'd have a dialog to get the name
        
        local response = sendRequest("studio:createModel", {
            name = "Script_" .. scriptName,
            initialState = {
                scriptType = "Script",
                source = "-- New script\nprint('Hello, world!')",
                parent = "ServerScriptService"
            }
        })
        
        if response and response.success then
            log("Script created: " .. scriptName)
            updateModelsList()
        else
            log("Failed to create script", "Error")
        end
    end)
    
    -- Create push to Roblox button
    local pushToRobloxButton = Instance.new("TextButton")
    pushToRobloxButton.Name = "PushToRobloxButton"
    pushToRobloxButton.Size = UDim2.new(0, 120, 0, 30)
    pushToRobloxButton.Position = UDim2.new(0, 130, 0, 0)
    pushToRobloxButton.Text = "Push to Roblox"
    pushToRobloxButton.Parent = ActionButtons
    
    pushToRobloxButton.MouseButton1Click:Connect(function()
        -- Get selected model
        local selectedModel = ModelsList:FindFirstChildWhichIsA("TextButton") and ModelsList:FindFirstChildWhichIsA("TextButton").Name
        
        if not selectedModel then
            log("No model selected", "Warning")
            return
        end
        
        log("Pushing model to Roblox: " .. selectedModel)
        
        -- In a real plugin, you would create actual Roblox objects based on the model data
        -- For now, we'll just simulate it
        
        local models = getModels()
        local modelData = nil
        
        for _, model in ipairs(models) do
            if model.name == selectedModel then
                modelData = model
                break
            end
        end
        
        if not modelData then
            log("Selected model not found in data", "Error")
            return
        end
        
        -- If it's a script, create a script instance
        if string.match(selectedModel, "^Script_") then
            local scriptName = string.gsub(selectedModel, "^Script_", "")
            local scriptType = modelData.state.scriptType or "Script"
            local source = modelData.state.source or ""
            local parent = modelData.state.parent or "ServerScriptService"
            
            local scriptInstance = nil
            
            if scriptType == "Script" then
                scriptInstance = Instance.new("Script")
            elseif scriptType == "LocalScript" then
                scriptInstance = Instance.new("LocalScript")
            elseif scriptType == "ModuleScript" then
                scriptInstance = Instance.new("ModuleScript")
            else
                log("Unknown script type: " .. scriptType, "Error")
                return
            end
            
            scriptInstance.Name = scriptName
            scriptInstance.Source = source
            
            local parentInstance = game
            
            for part in string.gmatch(parent, "[^.]+") do
                if parentInstance:FindFirstChild(part) then
                    parentInstance = parentInstance:FindFirstChild(part)
                else
                    log("Parent not found: " .. part, "Error")
                    return
                end
            end
            
            scriptInstance.Parent = parentInstance
            log("Script created in Roblox: " .. scriptName)
        end
    end)
end

-- Plugin initialization
local function initialize()
    -- Create plugin button
    local toolbar = plugin:CreateToolbar("MCP")
    local button = toolbar:CreateButton(
        "MCP", 
        "Connect to MCP server", 
        "rbxassetid://4458901886" -- Replace with your own icon ID
    )
    
    -- Create UI when button is clicked
    button.Click:Connect(function()
        if not PluginGui then
            createPluginUI()
        end
        
        PluginGui.Enabled = not PluginGui.Enabled
    end)
    
    log("Plugin initialized")
end

-- Register plugin
plugin = script.Parent
initialize() 