#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createAgent } from './agent';
import { InteractiveCLI } from './cli/interactive';
import { validateConfig } from './config';

const program = new Command();

program
  .name('agent-cli')
  .description('AI Agent CLI powered by LangChain and DeepSeek')
  .version('1.0.0');

program
  .command('chat')
  .description('Start an interactive chat session with the agent')
  .action(async () => {
    try {
      validateConfig();
      console.log(chalk.gray('Initializing agent...'));
      const agent = await createAgent();
      const cli = new InteractiveCLI(agent);
      await cli.start();
    } catch (error) {
      console.error(
        chalk.red('Error: ') +
          (error instanceof Error ? error.message : String(error))
      );
      process.exit(1);
    }
  });

program
  .command('run <prompt>')
  .description('Run a single prompt and exit')
  .action(async (prompt: string) => {
    try {
      validateConfig();
      const agent = await createAgent();
      const cwd = process.cwd();

      console.log(chalk.gray('Processing...'));
      const response = await agent.invoke({
        input: prompt,
        cwd,
      });

      console.log(chalk.blue('\nResult:\n'));
      console.log(response.output || 'No response generated.');
      console.log();
    } catch (error) {
      console.error(
        chalk.red('Error: ') +
          (error instanceof Error ? error.message : String(error))
      );
      process.exit(1);
    }
  });

// Default to chat if no command specified
program.action(async () => {
  try {
    validateConfig();
    console.log(chalk.gray('Initializing agent...'));
    const agent = await createAgent();
    const cli = new InteractiveCLI(agent);
    await cli.start();
  } catch (error) {
    console.error(
      chalk.red('Error: ') + (error instanceof Error ? error.message : String(error))
    );
    process.exit(1);
  }
});

program.parse();
