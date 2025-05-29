const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeAndEmbed(text) {
  // Summarize
  const summaryResp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `Summarize this trading strategy: ${text}` }],
  });
  const summary = summaryResp.choices[0].message.content;

  // Embed
  const embedResp = await openai.embeddings.create({
    input: summary,
    model: "text-embedding-ada-002",
  });
  const embedding = embedResp.data[0].embedding;

  return { summary, embedding };
}

module.exports = summarizeAndEmbed;

