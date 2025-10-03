import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const bashTool = new DynamicStructuredTool({
  name: 'bash',
  description: 'Execute a bash command and return the output. Use this for running shell commands, git operations, npm commands, etc.',
  schema: z.object({
    command: z.string().describe('The bash command to execute'),
  }),
  func: async ({ command }) => {
    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 30000, // 30 second timeout
      });

      let result = '';
      if (stdout) {
        result += `STDOUT:\n${stdout}`;
      }
      if (stderr) {
        result += `${stdout ? '\n\n' : ''}STDERR:\n${stderr}`;
      }

      return result || 'Command executed successfully with no output.';
    } catch (error: any) {
      return `Error executing command: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`;
    }
  },
});
