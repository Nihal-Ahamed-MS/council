import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../logger.js';

export async function* streamViaGemini(modelId, messages, keys) {
  const genAI = new GoogleGenerativeAI(keys.GEMINI_API_KEY);

  // strip provider prefix: "gemini/gemini-1.5-pro" → "gemini-1.5-pro"
  const model = modelId.replace(/^gemini\//, '');
  logger.info('Gemini stream start', { model });

  const genModel = genAI.getGenerativeModel({ model });

  // convert OpenAI-style messages to Gemini format
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1];

  try {
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    let tokenCount = 0;
    for await (const chunk of result.stream) {
      const token = chunk.text();
      if (token) {
        tokenCount++;
        yield token;
      }
    }
    logger.info('Gemini stream done', { model, tokens: tokenCount });
  } catch (err) {
    logger.error('Gemini stream error', { model, error: err.message });
    throw err;
  }
}
