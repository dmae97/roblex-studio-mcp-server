"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptGenerator = void 0;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
// Define the input schema for the scriptGenerator tool
const ScriptGeneratorInputSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, { message: 'Script description cannot be empty' })
        .describe('A detailed description of the desired script functionality.'),
});
// Define the tool's functionality
async function generateScript(input) {
    logger_js_1.logger.info('Generating script based on description:', { description: input.description });
    // Placeholder for actual script generation logic (e.g., call an LLM)
    // For now, return a simple example script
    const generatedScript = `
-- Script generated based on: ${input.description}
print("Hello from the generated script!")

local part = script.Parent
if part and part:IsA("BasePart") then
  part.Touched:Connect(function(otherPart)
    print(otherPart.Name .. " touched " .. part.Name)
  end)
end
`;
    return {
        content: [
            { type: 'text', text: generatedScript }
        ]
    };
}
// Function to register the tool with the McpServer
exports.scriptGenerator = {
    register: (server) => {
        // Remove the Schema argument from the tool registration
        server.tool('scriptGenerator', ScriptGeneratorInputSchema.shape, async (args, extra) => {
            try {
                const validatedParams = ScriptGeneratorInputSchema.parse(args);
                const baseResult = await generateScript(validatedParams);
                return {
                    ...baseResult,
                    _meta: extra?._meta
                };
            }
            catch (error) {
                logger_js_1.logger.error('Error in scriptGenerator tool:', {
                    error: error instanceof Error ? error.message : String(error),
                    inputParams: args
                });
                return {
                    content: [
                        { type: 'text', text: `Error generating script: ${error instanceof Error ? error.message : String(error)}` }
                    ],
                    isError: true,
                    _meta: extra?._meta
                };
            }
        });
        logger_js_1.logger.info('Registered tool: scriptGenerator');
    }
};
//# sourceMappingURL=scriptGenerator.js.map