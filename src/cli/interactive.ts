import * as readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { AgentExecutor } from 'langchain/agents';

export class InteractiveCLI {
  private rl: readline.Interface;
  private agent: AgentExecutor;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(agent: AgentExecutor) {
    this.agent = agent;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start(): void {
    console.log(chalk.bold.cyan('\n🤖 Agent CLI - Powered by LangChain & DeepSeek\n'));
    console.log(chalk.gray('Type your message and press Enter. Type "exit" or "quit" to end.\n'));

    this.promptUser();
  }

  private promptUser(): void {
    this.rl.question(chalk.green('You: '), async (input) => {
      const userInput = input.trim();

      if (!userInput) {
        this.promptUser();
        return;
      }

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log(chalk.yellow('\nGoodbye! 👋\n'));
        this.rl.close();
        return;
      }

      if (userInput.toLowerCase() === 'clear') {
        console.clear();
        this.conversationHistory = [];
        console.log(chalk.gray('Conversation history cleared.\n'));
        this.promptUser();
        return;
      }

      if (userInput.toLowerCase() === 'help') {
        this.showHelp();
        this.promptUser();
        return;
      }

      await this.processInput(userInput);
      this.promptUser();
    });
  }

  private async processInput(input: string): Promise<void> {
    const spinner = ora('Thinking...').start();

    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: input });

      // Get current working directory for context
      const cwd = process.cwd();

      // Invoke agent
      const response = await this.agent.invoke({
        input,
        cwd,
      });

      spinner.stop();

      // Add assistant response to history
      const output = response.output || 'No response generated.';
      this.conversationHistory.push({ role: 'assistant', content: output });

      // Display response
      console.log(chalk.blue('\nAssistant: ') + output + '\n');
    } catch (error) {
      spinner.stop();
      console.error(
        chalk.red('\nError: ') +
          (error instanceof Error ? error.message : String(error)) +
          '\n'
      );
    }
  }

  private showHelp(): void {
    console.log(chalk.bold('\nAvailable Commands:'));
    console.log(chalk.gray('  help  - Show this help message'));
    console.log(chalk.gray('  clear - Clear conversation history'));
    console.log(chalk.gray('  exit  - Exit the CLI'));
    console.log(chalk.bold('\nAvailable Tools:'));
    console.log(chalk.gray('  • File operations: read, write, edit, list files'));
    console.log(chalk.gray('  • Search: glob (file patterns), grep (text search)'));
    console.log(chalk.gray('  • Execute: bash commands\n'));
  }
}
