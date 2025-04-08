import { z } from 'zod';
import { McpServer } from '../server/McpServer.js'; // Adjust path as necessary
import { logger } from '../utils/logger.js';

// Define the input schema for the scriptGenerator tool
const ScriptGeneratorInputSchema = z.object({
  description: z.string().min(1, { message: 'Script description cannot be empty' })
    .describe('A detailed description of the desired script functionality.'),
});

// Define the tool's functionality
async function generateScript(input: z.infer<typeof ScriptGeneratorInputSchema>) {
  logger.info('Generating script based on description:', { description: input.description });

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
    content: [{ type: 'text', text: generatedScript }]
  };
}

// Function to register the tool with the McpServer
export const scriptGenerator = {
  register: (server: McpServer) => {
    // Remove the Schema argument from the tool registration
    server.tool(
      'scriptGenerator',
      // ScriptGeneratorInputSchema removed from here
      // Add 'unknown' type annotation for params
      async (params: unknown) => {
        try {
          // Validate input using the schema
          const validatedParams = ScriptGeneratorInputSchema.parse(params);
          return await generateScript(validatedParams);
        } catch (error) {
          logger.error('Error in scriptGenerator tool:', {
            error: error instanceof Error ? error.message : String(error),
            inputParams: params
          });
          // Return an error response in the expected format
          return {
            content: [{ type: 'text', text: `Error generating script: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true
          };
        }
      }
      // Description removed from here, should be handled by ListToolsRequestSchema handler if needed
    );
    logger.info('Registered tool: scriptGenerator');
  }
};