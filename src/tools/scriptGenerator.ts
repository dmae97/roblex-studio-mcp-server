import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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
    content: [
      { type: 'text', text: generatedScript } as Record<string, unknown>
    ]
  } as Record<string, unknown>;
}

// Function to register the tool with the McpServer
export const scriptGenerator = {
  register: (server: McpServer) => {
    // Remove the Schema argument from the tool registration
    server.tool(
      'scriptGenerator',
      ScriptGeneratorInputSchema.shape,
      async (
        args: { description: string },
        extra: any
      ): Promise<{
        [x: string]: unknown;
        content: (
          | { [x: string]: unknown; type: 'text'; text: string }
          | { [x: string]: unknown; type: 'image'; data: string; mimeType: string }
          | { [x: string]: unknown; type: 'audio'; data: string; mimeType: string }
          | { [x: string]: unknown; type: 'resource'; resource: any }
        )[];
        isError?: boolean;
        _meta?: any;
      }> => {
        try {
          const validatedParams = ScriptGeneratorInputSchema.parse(args);
          const baseResult = await generateScript(validatedParams);
          return {
            ...baseResult,
            _meta: extra?._meta
          } as any;
        } catch (error) {
          logger.error('Error in scriptGenerator tool:', {
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
      }
    );
    logger.info('Registered tool: scriptGenerator');
  }
};