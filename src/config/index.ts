import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
  },
  agent: {
    maxIterations: parseInt(process.env.MAX_ITERATIONS || '10', 10),
  },
};

export function validateConfig(): void {
  if (!config.deepseek.apiKey) {
    throw new Error(
      'DEEPSEEK_API_KEY is not set. Please create a .env file with your DeepSeek API key.'
    );
  }
}
