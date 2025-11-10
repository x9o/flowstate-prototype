// DeepSeek API Test Script
// Please install OpenAI SDK first: `npm install openai`

import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY,
});

async function testBasicChat() {
  console.log('\n=== Testing Basic Chat ===');
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "deepseek-chat",
    });

    console.log('Response:', completion.choices[0].message.content);
    console.log('Usage:', completion.usage);
  } catch (error) {
    console.error('Basic chat error:', error.message);
  }
}

async function testTaskValidation() {
  console.log('\n=== Testing Task Validation ===');

  const testTasks = [
    "Finish physics homework chapter 5",
    "Watch YouTube videos",
    "Complete project presentation for client",
    "Scroll social media"
  ];

  for (const task of testTasks) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that validates if tasks are productive for focus sessions.

Respond with ONLY "YES" or "NO" and a brief explanation (max 10 words).

- YES if the task is productive, work-related, or educational
- NO if the task is entertainment, social media, or procrastination`
          },
          {
            role: "user",
            content: `Is this a productive task for a focus session: "${task}"`
          }
        ],
        model: "deepseek-chat",
        max_tokens: 50,
        temperature: 0.1
      });

      console.log(`Task: "${task}"`);
      console.log(`Response: ${completion.choices[0].message.content.trim()}`);
      console.log('---');
    } catch (error) {
      console.error(`Task validation error for "${task}":`, error.message);
    }
  }
}

async function testProductivityCheck() {
  console.log('\n=== Testing Productivity Check (like monitoring service) ===');

  const scenarios = [
    {
      goal: "Complete Q3 sales presentation",
      activity: "Working on PowerPoint slides",
      app: "Microsoft PowerPoint"
    },
    {
      goal: "Study for chemistry exam",
      activity: "Watching chemistry tutorial videos",
      app: "YouTube"
    },
    {
      goal: "Write project proposal",
      activity: "Browsing news articles",
      app: "Google Chrome"
    },
    {
      goal: "Debug authentication flow",
      activity: "Checking social media feeds",
      app: "Instagram"
    }
  ];

  for (const scenario of scenarios) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are monitoring user productivity for a focus session with goal: "${scenario.goal}".

Determine if the current activity is productive toward this goal. Respond with ONLY "YES" or "NO" and a very brief explanation.

Consider:
- Is this activity directly related to the goal?
- Is this a reasonable work/research activity?
- Is this clearly a distraction or procrastination?

Be strict but reasonable.`
          },
          {
            role: "user",
            content: `Activity: "${scenario.activity}" in app: "${scenario.app}"

Is this productive for the goal: "${scenario.goal}"?`
          }
        ],
        model: "deepseek-chat",
        max_tokens: 30,
        temperature: 0.1
      });

      console.log(`Goal: "${scenario.goal}"`);
      console.log(`Activity: "${scenario.activity}" (${scenario.app})`);
      console.log(`Response: ${completion.choices[0].message.content.trim()}`);
      console.log('---');
    } catch (error) {
      console.error(`Productivity check error:`, error.message);
    }
  }
}

async function testTaskEnhancement() {
  console.log('\n=== Testing Task Enhancement ===');

  const basicTasks = [
    "homework",
    "prepare slides",
    "study",
    "write report"
  ];

  for (const task of basicTasks) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a task enhancement assistant. Take basic task descriptions and make them more specific, actionable, and professional.

Keep responses under 15 words. Make tasks concrete and measurable.`
          },
          {
            role: "user",
            content: `Enhance this task: "${task}"`
          }
        ],
        model: "deepseek-chat",
        max_tokens: 25,
        temperature: 0.3
      });

      console.log(`Original: "${task}"`);
      console.log(`Enhanced: ${completion.choices[0].message.content.trim()}`);
      console.log('---');
    } catch (error) {
      console.error(`Task enhancement error for "${task}":`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 DeepSeek API Testing Started');
  console.log('===============================');

  await testBasicChat();
  await testTaskValidation();
  await testProductivityCheck();
  await testTaskEnhancement();

  console.log('\n✅ DeepSeek API Testing Complete');
}

main().catch(console.error);