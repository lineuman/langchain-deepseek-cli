import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

export const readFileTool = new DynamicStructuredTool({
  name: 'read_file',
  description: 'Read the contents of a file. Provide the absolute or relative file path.',
  schema: z.object({
    filePath: z.string().describe('The path to the file to read'),
  }),
  func: async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return `File: ${filePath}\n\n${content}`;
    } catch (error) {
      return `Error reading file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const writeFileTool = new DynamicStructuredTool({
  name: 'write_file',
  description: 'Write content to a file. Creates the file if it doesn\'t exist, overwrites if it does.',
  schema: z.object({
    filePath: z.string().describe('The path to the file to write'),
    content: z.string().describe('The content to write to the file'),
  }),
  func: async ({ filePath, content }) => {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      return `Successfully wrote to ${filePath}`;
    } catch (error) {
      return `Error writing file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const editFileTool = new DynamicStructuredTool({
  name: 'edit_file',
  description: 'Edit a file by replacing old text with new text. Performs exact string replacement.',
  schema: z.object({
    filePath: z.string().describe('The path to the file to edit'),
    oldText: z.string().describe('The exact text to replace'),
    newText: z.string().describe('The new text to insert'),
  }),
  func: async ({ filePath, oldText, newText }) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (!content.includes(oldText)) {
        return `Error: Could not find the text to replace in ${filePath}`;
      }
      const newContent = content.replace(oldText, newText);
      await fs.writeFile(filePath, newContent, 'utf-8');
      return `Successfully edited ${filePath}`;
    } catch (error) {
      return `Error editing file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const listFilesTool = new DynamicStructuredTool({
  name: 'list_files',
  description: 'List all files in a directory. Optionally specify a directory path.',
  schema: z.object({
    dirPath: z.string().optional().describe('The directory path to list files from (defaults to current directory)'),
  }),
  func: async ({ dirPath = '.' }) => {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      const fileList = files.map(file => {
        const type = file.isDirectory() ? '[DIR]' : '[FILE]';
        return `${type} ${file.name}`;
      }).join('\n');
      return `Files in ${dirPath}:\n${fileList}`;
    } catch (error) {
      return `Error listing files: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});
