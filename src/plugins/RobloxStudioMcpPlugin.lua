--[[
Roblox Studio MCP Plugin
Version: 1.0.0
Description: Connect Roblox Studio to the MCP Server with Sequential MCP support and Claude Desktop integration
]]

-- Services
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Selection = game:GetService("Selection")

-- Constants
local DEFAULT_SERVER_URL = "http://localhost:3001"
local PLUGIN_NAME = "MCP Server Connection"
local PLUGIN_VERSION = "1.0.0"
local TOOLBAR_NAME = "MCP Toolkit"
local TOOLBAR_ICON = "rbxassetid://6031068428" -- Adjusted for plugin icon
local CONNECTION_TIMEOUT = 15 -- seconds
local HEARTBEAT_INTERVAL = 30 -- seconds

-- Plugin state
local plugin = script:FindFirstAncestorWhichIsA("Plugin")
local toolbar = plugin:CreateToolbar(TOOLBAR_NAME)
local connectButton = toolbar:CreateButton(
    "Connect MCP",
    "Connect to MCP Server",
    TOOLBAR_ICON
)
local claudeButton = toolbar:CreateButton(
    "Claude Desktop",
    "Connect to Claude Desktop Assistant",
    "rbxassetid://6026568254"
)
local debugButton = toolbar:CreateButton(
    "Debug Console",
    "Show/Hide Debug Console",
    "rbxassetid://6031225819"
)

-- Configuration
local config = {
    serverUrl = DEFAULT_SERVER_URL,
    sessionId = nil,
    connected = false,
    claudeConnected = false,
    debugVisible = false,
    activeRequests = {},
    requestId = 0,
    eventListeners = {},
    heartbeatTimer = nil,
    lastHeartbeatResponse = 0
}

-- UI Elements
local mainWidget = plugin:CreateDockWidgetPluginGui(
    "MCPConnectionWidget",
    DockWidgetPluginGuiInfo.new(
        Enum.InitialDockState.Float,
        true,
        false,
        350,
        300,
        350,
        300
    )
)
mainWidget.Title = PLUGIN_NAME .. " v" .. PLUGIN_VERSION
mainWidget.Name = "MCPConnectionWidget"

local debugWidget = plugin:CreateDockWidgetPluginGui(
    "MCPDebugWidget",
    DockWidgetPluginGuiInfo.new(
        Enum.InitialDockState.Float,
        false,
        false,
        400,
        500,
        300,
        300
    )
)
debugWidget.Title = "MCP Debug Console"
debugWidget.Name = "MCPDebugWidget"

-- Create UI
local function createMainUI()
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, 0, 1, 0)
    frame.BackgroundColor3 = Color3.fromRGB(240, 240, 240)
    frame.BorderSizePixel = 0
    frame.Parent = mainWidget

    local uiLayout = Instance.new("UIListLayout")
    uiLayout.Padding = UDim.new(0, 10)
    uiLayout.FillDirection = Enum.FillDirection.Vertical
    uiLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    uiLayout.VerticalAlignment = Enum.VerticalAlignment.Top
    uiLayout.SortOrder = Enum.SortOrder.LayoutOrder
    uiLayout.Parent = frame

    local padding = Instance.new("UIPadding")
    padding.PaddingTop = UDim.new(0, 10)
    padding.PaddingBottom = UDim.new(0, 10)
    padding.PaddingLeft = UDim.new(0, 10)
    padding.PaddingRight = UDim.new(0, 10)
    padding.Parent = frame

    -- Title
    local titleLabel = Instance.new("TextLabel")
    titleLabel.Size = UDim2.new(1, 0, 0, 30)
    titleLabel.BackgroundTransparency = 1
    titleLabel.TextSize = 18
    titleLabel.Font = Enum.Font.SourceSansBold
    titleLabel.Text = "MCP Server Connection"
    titleLabel.TextColor3 = Color3.fromRGB(50, 50, 50)
    titleLabel.LayoutOrder = 1
    titleLabel.Parent = frame

    -- URL Input
    local urlLabel = Instance.new("TextLabel")
    urlLabel.Size = UDim2.new(1, 0, 0, 20)
    urlLabel.BackgroundTransparency = 1
    urlLabel.TextSize = 14
    urlLabel.Font = Enum.Font.SourceSans
    urlLabel.Text = "Server URL:"
    urlLabel.TextColor3 = Color3.fromRGB(50, 50, 50)
    urlLabel.TextXAlignment = Enum.TextXAlignment.Left
    urlLabel.LayoutOrder = 2
    urlLabel.Parent = frame

    local urlInput = Instance.new("TextBox")
    urlInput.Size = UDim2.new(1, 0, 0, 30)
    urlInput.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
    urlInput.TextSize = 14
    urlInput.Font = Enum.Font.SourceSans
    urlInput.Text = config.serverUrl
    urlInput.TextColor3 = Color3.fromRGB(50, 50, 50)
    urlInput.PlaceholderText = "Enter server URL..."
    urlInput.LayoutOrder = 3
    urlInput.TextXAlignment = Enum.TextXAlignment.Left
    urlInput.Parent = frame
    urlInput.ClearTextOnFocus = false

    urlInput.FocusLost:Connect(function()
        config.serverUrl = urlInput.Text
    end)

    -- Status
    local statusContainer = Instance.new("Frame")
    statusContainer.Size = UDim2.new(1, 0, 0, 30)
    statusContainer.BackgroundTransparency = 1
    statusContainer.LayoutOrder = 4
    statusContainer.Parent = frame

    local statusLabel = Instance.new("TextLabel")
    statusLabel.Size = UDim2.new(0, 100, 1, 0)
    statusLabel.Position = UDim2.new(0, 0, 0, 0)
    statusLabel.BackgroundTransparency = 1
    statusLabel.TextSize = 14
    statusLabel.Font = Enum.Font.SourceSans
    statusLabel.Text = "Status:"
    statusLabel.TextColor3 = Color3.fromRGB(50, 50, 50)
    statusLabel.TextXAlignment = Enum.TextXAlignment.Left
    statusLabel.Parent = statusContainer

    local statusValue = Instance.new("TextLabel")
    statusValue.Size = UDim2.new(0, 100, 1, 0)
    statusValue.Position = UDim2.new(0, 100, 0, 0)
    statusValue.BackgroundTransparency = 1
    statusValue.TextSize = 14
    statusValue.Font = Enum.Font.SourceSansBold
    statusValue.Text = "Disconnected"
    statusValue.TextColor3 = Color3.fromRGB(255, 0, 0)
    statusValue.TextXAlignment = Enum.TextXAlignment.Left
    statusValue.Name = "StatusValue"
    statusValue.Parent = statusContainer

    -- Claude Integration Status
    local claudeContainer = Instance.new("Frame")
    claudeContainer.Size = UDim2.new(1, 0, 0, 30)
    claudeContainer.BackgroundTransparency = 1
    claudeContainer.LayoutOrder = 5
    claudeContainer.Parent = frame

    local claudeLabel = Instance.new("TextLabel")
    claudeLabel.Size = UDim2.new(0, 100, 1, 0)
    claudeLabel.Position = UDim2.new(0, 0, 0, 0)
    claudeLabel.BackgroundTransparency = 1
    claudeLabel.TextSize = 14
    claudeLabel.Font = Enum.Font.SourceSans
    claudeLabel.Text = "Claude Desktop:"
    claudeLabel.TextColor3 = Color3.fromRGB(50, 50, 50)
    claudeLabel.TextXAlignment = Enum.TextXAlignment.Left
    claudeLabel.Parent = claudeContainer

    local claudeStatus = Instance.new("TextLabel")
    claudeStatus.Size = UDim2.new(0, 100, 1, 0)
    claudeStatus.Position = UDim2.new(0, 100, 0, 0)
    claudeStatus.BackgroundTransparency = 1
    claudeStatus.TextSize = 14
    claudeStatus.Font = Enum.Font.SourceSansBold
    claudeStatus.Text = "Not Connected"
    claudeStatus.TextColor3 = Color3.fromRGB(150, 150, 150)
    claudeStatus.TextXAlignment = Enum.TextXAlignment.Left
    claudeStatus.Name = "ClaudeStatus"
    claudeStatus.Parent = claudeContainer

    -- Session ID
    local sessionContainer = Instance.new("Frame")
    sessionContainer.Size = UDim2.new(1, 0, 0, 30)
    sessionContainer.BackgroundTransparency = 1
    sessionContainer.LayoutOrder = 6
    sessionContainer.Parent = frame

    local sessionLabel = Instance.new("TextLabel")
    sessionLabel.Size = UDim2.new(0, 100, 1, 0)
    sessionLabel.Position = UDim2.new(0, 0, 0, 0)
    sessionLabel.BackgroundTransparency = 1
    sessionLabel.TextSize = 14
    sessionLabel.Font = Enum.Font.SourceSans
    sessionLabel.Text = "Session ID:"
    sessionLabel.TextColor3 = Color3.fromRGB(50, 50, 50)
    sessionLabel.TextXAlignment = Enum.TextXAlignment.Left
    sessionLabel.Parent = sessionContainer

    local sessionValue = Instance.new("TextLabel")
    sessionValue.Size = UDim2.new(1, -100, 1, 0)
    sessionValue.Position = UDim2.new(0, 100, 0, 0)
    sessionValue.BackgroundTransparency = 1
    sessionValue.TextSize = 14
    sessionValue.Font = Enum.Font.SourceSansItalic
    sessionValue.Text = "None"
    sessionValue.TextColor3 = Color3.fromRGB(100, 100, 100)
    sessionValue.TextXAlignment = Enum.TextXAlignment.Left
    sessionValue.TextTruncate = Enum.TextTruncate.AtEnd
    sessionValue.Name = "SessionValue"
    sessionValue.Parent = sessionContainer

    return {
        statusValue = statusValue,
        claudeStatus = claudeStatus,
        sessionValue = sessionValue,
        urlInput = urlInput
    }
end

local function createDebugUI()
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, 0, 1, 0)
    frame.BackgroundColor3 = Color3.fromRGB(240, 240, 240)
    frame.BorderSizePixel = 0
    frame.Parent = debugWidget

    local uiLayout = Instance.new("UIListLayout")
    uiLayout.Padding = UDim.new(0, 5)
    uiLayout.FillDirection = Enum.FillDirection.Vertical
    uiLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    uiLayout.VerticalAlignment = Enum.VerticalAlignment.Top
    uiLayout.SortOrder = Enum.SortOrder.LayoutOrder
    uiLayout.Parent = frame

    local padding = Instance.new("UIPadding")
    padding.PaddingTop = UDim.new(0, 10)
    padding.PaddingBottom = UDim.new(0, 10)
    padding.PaddingLeft = UDim.new(0, 10)
    padding.PaddingRight = UDim.new(0, 10)
    padding.Parent = frame

    -- Title
    local titleLabel = Instance.new("TextLabel")
    titleLabel.Size = UDim2.new(1, 0, 0, 30)
    titleLabel.BackgroundTransparency = 1
    titleLabel.TextSize = 18
    titleLabel.Font = Enum.Font.SourceSansBold
    titleLabel.Text = "Debug Console"
    titleLabel.TextColor3 = Color3.fromRGB(50, 50, 50)
    titleLabel.LayoutOrder = 1
    titleLabel.Parent = frame

    -- Log Container
    local scrollFrame = Instance.new("ScrollingFrame")
    scrollFrame.Size = UDim2.new(1, 0, 1, -80)
    scrollFrame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
    scrollFrame.BorderColor3 = Color3.fromRGB(200, 200, 200)
    scrollFrame.LayoutOrder = 2
    scrollFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
    scrollFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
    scrollFrame.ScrollBarThickness = 8
    scrollFrame.Parent = frame

    local logLayout = Instance.new("UIListLayout")
    logLayout.Padding = UDim.new(0, 2)
    logLayout.FillDirection = Enum.FillDirection.Vertical
    logLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
    logLayout.VerticalAlignment = Enum.VerticalAlignment.Top
    logLayout.SortOrder = Enum.SortOrder.LayoutOrder
    logLayout.Parent = scrollFrame

    local logPadding = Instance.new("UIPadding")
    logPadding.PaddingTop = UDim.new(0, 5)
    logPadding.PaddingBottom = UDim.new(0, 5)
    logPadding.PaddingLeft = UDim.new(0, 5)
    logPadding.PaddingRight = UDim.new(0, 5)
    logPadding.Parent = scrollFrame

    -- Control buttons
    local buttonContainer = Instance.new("Frame")
    buttonContainer.Size = UDim2.new(1, 0, 0, 30)
    buttonContainer.BackgroundTransparency = 1
    buttonContainer.LayoutOrder = 3
    buttonContainer.Parent = frame

    local buttonsLayout = Instance.new("UIListLayout")
    buttonsLayout.Padding = UDim.new(0, 10)
    buttonsLayout.FillDirection = Enum.FillDirection.Horizontal
    buttonsLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    buttonsLayout.VerticalAlignment = Enum.VerticalAlignment.Center
    buttonsLayout.SortOrder = Enum.SortOrder.LayoutOrder
    buttonsLayout.Parent = buttonContainer

    local clearButton = Instance.new("TextButton")
    clearButton.Size = UDim2.new(0, 100, 0, 30)
    clearButton.BackgroundColor3 = Color3.fromRGB(230, 230, 230)
    clearButton.BorderColor3 = Color3.fromRGB(200, 200, 200)
    clearButton.TextSize = 14
    clearButton.Font = Enum.Font.SourceSans
    clearButton.Text = "Clear Logs"
    clearButton.TextColor3 = Color3.fromRGB(50, 50, 50)
    clearButton.LayoutOrder = 1
    clearButton.Parent = buttonContainer

    clearButton.MouseButton1Click:Connect(function()
        for _, child in ipairs(scrollFrame:GetChildren()) do
            if child:IsA("TextLabel") then
                child:Destroy()
            end
        end
    end)

    return {
        logContainer = scrollFrame,
        clearButton = clearButton
    }
end

-- UI Instances
local mainUI = createMainUI()
local debugUI = createDebugUI()

-- Logging Functions
local logLevels = {
    INFO = Color3.fromRGB(0, 120, 255),
    SUCCESS = Color3.fromRGB(0, 180, 0),
    WARNING = Color3.fromRGB(255, 150, 0),
    ERROR = Color3.fromRGB(255, 0, 0),
    DEBUG = Color3.fromRGB(150, 150, 150)
}

local function log(message, level)
    level = level or "INFO"
    local color = logLevels[level] or logLevels.INFO
    
    -- Print to output
    print(string.format("[MCP %s] %s", level, message))
    
    -- Add to debug UI
    local logEntry = Instance.new("TextLabel")
    logEntry.Size = UDim2.new(1, 0, 0, 20)
    logEntry.BackgroundTransparency = 1
    logEntry.TextSize = 14
    logEntry.Font = Enum.Font.SourceSans
    logEntry.Text = string.format("[%s] %s", level, message)
    logEntry.TextColor3 = color
    logEntry.TextXAlignment = Enum.TextXAlignment.Left
    logEntry.TextWrapped = true
    logEntry.AutomaticSize = Enum.AutomaticSize.Y
    logEntry.LayoutOrder = #debugUI.logContainer:GetChildren()
    logEntry.Parent = debugUI.logContainer
    
    -- Auto scroll to bottom
    debugUI.logContainer.CanvasPosition = Vector2.new(0, 9999999)
end

-- Networking Functions
local function makeHttpRequest(method, url, data)
    local success, result
    
    config.requestId = config.requestId + 1
    local requestId = config.requestId
    
    local requestInfo = {
        id = requestId,
        method = method,
        url = url,
        startTime = tick()
    }
    
    config.activeRequests[requestId] = requestInfo
    
    local options = {
        Method = method,
        Headers = {
            ["Content-Type"] = "application/json"
        }
    }
    
    if data then
        options.Body = HttpService:JSONEncode(data)
    end
    
    log(string.format("Request #%d: %s %s", requestId, method, url), "DEBUG")
    
    success, result = pcall(function()
        return HttpService:RequestAsync(options)
    end)
    
    config.activeRequests[requestId] = nil
    
    if success then
        local responseSuccess = result.Success
        local status = result.StatusCode
        local responseBody = result.Body
        
        log(string.format("Response #%d: Status %d", requestId, status), "DEBUG")
        
        if responseSuccess then
            local decodedBody = nil
            local decodeSuccess, decodeResult = pcall(function()
                return HttpService:JSONDecode(responseBody)
            end)
            
            if decodeSuccess then
                decodedBody = decodeResult
            end
            
            return true, decodedBody or responseBody, status
        else
            log(string.format("Request failed: %s", responseBody), "ERROR")
            return false, responseBody, status
        end
    else
        log(string.format("HTTP Request Error: %s", tostring(result)), "ERROR")
        return false, tostring(result), 0
    end
end

local function connectToMCP()
    if config.connected then
        log("Already connected to MCP Server", "WARNING")
        return
    end
    
    local url = config.serverUrl
    if not url or url == "" then
        url = DEFAULT_SERVER_URL
        config.serverUrl = url
        mainUI.urlInput.Text = url
    end
    
    -- Check server health first
    log("Checking server health...", "INFO")
    local healthSuccess, healthData = makeHttpRequest("GET", url .. "/health")
    
    if not healthSuccess then
        log("Failed to connect to MCP Server. Server might be offline.", "ERROR")
        return
    end
    
    -- Get session ID
    log("Server is online. Initializing connection...", "INFO")
    
    local success, data = makeHttpRequest("GET", url .. "/sse", nil)
    
    if not success then
        log("Failed to initialize SSE connection", "ERROR")
        return
    end
    
    config.sessionId = data.sessionId
    config.connected = true
    
    -- Update UI
    mainUI.statusValue.Text = "Connected"
    mainUI.statusValue.TextColor3 = Color3.fromRGB(0, 180, 0)
    mainUI.sessionValue.Text = config.sessionId
    
    -- Start heartbeat
    startHeartbeat()
    
    log("Successfully connected to MCP Server", "SUCCESS")
    log("Session ID: " .. config.sessionId, "INFO")
    
    -- Update button appearance
    connectButton:SetActive(true)
    
    return true
end

local function disconnectFromMCP()
    if not config.connected then
        return
    end
    
    -- Stop heartbeat
    if config.heartbeatTimer then
        config.heartbeatTimer:Disconnect()
        config.heartbeatTimer = nil
    end
    
    -- Call disconnect endpoint
    if config.sessionId then
        local success, _ = makeHttpRequest("POST", config.serverUrl .. "/auth/logout?sessionId=" .. config.sessionId)
        
        if success then
            log("Successfully disconnected from MCP Server", "INFO")
        else
            log("Error while disconnecting from server", "WARNING")
        end
    end
    
    -- Update state
    config.connected = false
    config.claudeConnected = false
    config.sessionId = nil
    
    -- Update UI
    mainUI.statusValue.Text = "Disconnected"
    mainUI.statusValue.TextColor3 = Color3.fromRGB(255, 0, 0)
    mainUI.sessionValue.Text = "None"
    mainUI.claudeStatus.Text = "Not Connected"
    mainUI.claudeStatus.TextColor3 = Color3.fromRGB(150, 150, 150)
    
    -- Update button appearance
    connectButton:SetActive(false)
    claudeButton:SetActive(false)
    
    log("Disconnected from MCP Server", "INFO")
end

local function connectToClaudeDesktop()
    if not config.connected then
        log("Please connect to MCP Server first", "WARNING")
        return
    end
    
    if config.claudeConnected then
        log("Already connected to Claude Desktop", "WARNING")
        return
    end
    
    log("Connecting to Claude Desktop...", "INFO")
    
    local url = config.serverUrl .. "/claude/connect"
    local success, data = makeHttpRequest("POST", url, {
        clientName = "RobloxStudioPlugin"
    })
    
    if not success then
        log("Failed to connect to Claude Desktop", "ERROR")
        return
    end
    
    config.claudeConnected = true
    
    -- Update UI
    mainUI.claudeStatus.Text = "Connected"
    mainUI.claudeStatus.TextColor3 = Color3.fromRGB(0, 180, 0)
    
    -- Update button appearance
    claudeButton:SetActive(true)
    
    log("Successfully connected to Claude Desktop", "SUCCESS")
    return true
end

local function startHeartbeat()
    if config.heartbeatTimer then
        config.heartbeatTimer:Disconnect()
    end
    
    config.lastHeartbeatResponse = tick()
    
    config.heartbeatTimer = RunService.Heartbeat:Connect(function()
        if not config.connected then
            return
        end
        
        local now = tick()
        if now - config.lastHeartbeatResponse > HEARTBEAT_INTERVAL then
            -- Send heartbeat
            config.lastHeartbeatResponse = now
            
            local success, _ = makeHttpRequest("GET", config.serverUrl .. "/ping")
            
            if not success then
                log("Heartbeat failed. Connection might be lost.", "WARNING")
                
                -- Check if too many heartbeats failed
                if now - config.lastHeartbeatResponse > CONNECTION_TIMEOUT then
                    log("Connection timed out. Disconnecting...", "ERROR")
                    disconnectFromMCP()
                end
            end
        end
    end)
end

-- Button Callbacks
connectButton.Click:Connect(function()
    if not config.connected then
        connectToMCP()
    else
        disconnectFromMCP()
    end
end)

claudeButton.Click:Connect(function()
    if not config.connected then
        log("Please connect to MCP Server first", "WARNING")
        return
    end
    
    if not config.claudeConnected then
        connectToClaudeDesktop()
    else
        -- Disconnect Claude feature
        config.claudeConnected = false
        mainUI.claudeStatus.Text = "Not Connected"
        mainUI.claudeStatus.TextColor3 = Color3.fromRGB(150, 150, 150)
        claudeButton:SetActive(false)
        log("Disconnected from Claude Desktop", "INFO")
    end
end)

debugButton.Click:Connect(function()
    config.debugVisible = not config.debugVisible
    debugWidget.Enabled = config.debugVisible
    debugButton:SetActive(config.debugVisible)
end)

-- Plugin initialization
mainWidget.Enabled = true
debugWidget.Enabled = false

log("MCP Plugin initialized", "INFO")
log("Version: " .. PLUGIN_VERSION, "INFO")

-- Clean up on unload
plugin.Unloading:Connect(function()
    disconnectFromMCP()
    log("Plugin unloaded", "INFO")
end)

-- Return API for plugin scripting
return {
    connect = connectToMCP,
    disconnect = disconnectFromMCP,
    connectToClaudeDesktop = connectToClaudeDesktop,
    sendMessage = function(messageType, data)
        if not config.connected or not config.sessionId then
            return false, "Not connected"
        end
        
        local url = config.serverUrl .. "/messages?sessionId=" .. config.sessionId
        local success, response = makeHttpRequest("POST", url, {
            type = messageType,
            data = data
        })
        
        return success, response
    end,
    getSessionId = function()
        return config.sessionId
    end,
    isConnected = function()
        return config.connected
    end,
    isClaudeConnected = function()
        return config.claudeConnected
    end,
    log = log
}
