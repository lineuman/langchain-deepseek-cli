import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip common directories to ignore
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
        continue;
      }
      yield* walkDirectory(fullPath);
    } else {
      yield fullPath;
    }
  }
}

export const globTool = new DynamicStructuredTool({
  name: 'glob',
  description: 'Search for files matching a pattern. Supports wildcards like *.js, *.ts, etc.',
  schema: z.object({
    pattern: z.string().describe('File pattern to search for (e.g., "*.ts", "**/*.json")'),
    directory: z.string().optional().describe('Directory to search in (defaults to current directory)'),
  }),
  func: async ({ pattern, directory = '.' }) => {
    try {
      const files: string[] = [];
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
      const regex = new RegExp(regexPattern);

      for await (const file of walkDirectory(directory)) {
        const relativePath = path.relative(directory, file);
        if (regex.test(relativePath) || regex.test(path.basename(file))) {
          files.push(file);
        }
      }

      if (files.length === 0) {
        return `No files found matching pattern: ${pattern}`;
      }

      return `Found ${files.length} file(s):\n${files.join('\n')}`;
    } catch (error) {
      return `Error searching files: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const grepTool = new DynamicStructuredTool({
  name: 'grep',
  description: 'Search for text content within files. Returns matching lines with file names.',
  schema: z.object({
    searchText: z.string().describe('Text to search for'),
    filePattern: z.string().optional().describe('File pattern to search in (e.g., "*.ts")'),
    directory: z.string().optional().describe('Directory to search in (defaults to current directory)'),
  }),
  func: async ({ searchText, filePattern = '*', directory = '.' }) => {
    try {
      const matches: string[] = [];
      const regexPattern = filePattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
      const fileRegex = new RegExp(regexPattern);

      for await (const file of walkDirectory(directory)) {
        const relativePath = path.relative(directory, file);

        if (!fileRegex.test(relativePath) && !fileRegex.test(path.basename(file))) {
          continue;
        }

        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            if (line.includes(searchText)) {
              matches.push(`${file}:${index + 1}: ${line.trim()}`);
            }
          });
        } catch (error) {
          // Skip files that can't be read as text
          continue;
        }
      }

      if (matches.length === 0) {
        return `No matches found for: ${searchText}`;
      }

      const maxResults = 50;
      const displayMatches = matches.slice(0, maxResults);
      let result = `Found ${matches.length} match(es):\n${displayMatches.join('\n')}`;

      if (matches.length > maxResults) {
        result += `\n\n... and ${matches.length - maxResults} more matches`;
      }

      return result;
    } catch (error) {
      return `Error searching content: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});
