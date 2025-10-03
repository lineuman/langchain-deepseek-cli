import { ChatDeepSeek } from '@langchain/deepseek';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { PromptTemplate } from '@langchain/core/prompts';
import { allTools } from '../tools';
import { config } from '../config';

export async function createAgent() {
  const model = new ChatDeepSeek({
    apiKey: config.deepseek.apiKey,
    model: config.deepseek.model,
    temperature: config.deepseek.temperature,
  });

  const prompt = PromptTemplate.fromTemplate(
    `You are a helpful AI assistant that can help with file operations, code tasks, and system commands.

Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}`
  );

  const agent = await createReactAgent({
    llm: model,
    tools: allTools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools: allTools,
    maxIterations: config.agent.maxIterations,
    verbose: false,
  });

  return agentExecutor;
}
