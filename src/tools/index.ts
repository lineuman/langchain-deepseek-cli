import { readFileTool, writeFileTool, editFileTool, listFilesTool } from './file-tools';
import { bashTool } from './bash-tool';
import { globTool, grepTool } from './search-tools';

export const allTools = [
  readFileTool,
  writeFileTool,
  editFileTool,
  listFilesTool,
  bashTool,
  globTool,
  grepTool,
];

export {
  readFileTool,
  writeFileTool,
  editFileTool,
  listFilesTool,
  bashTool,
  globTool,
  grepTool,
};
