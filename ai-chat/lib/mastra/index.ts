// Mastra 에이전트 설정 파일
// 현재는 API 라우트에서 AI SDK streamText를 직접 사용하고,
// 이 파일은 향후 복잡한 에이전트 기능(도구 사용, 워크플로우 등) 확장을 위해 유지합니다.

import { Agent } from "@mastra/core/agent";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const englishTutorAgent = new Agent({
  id: "english-tutor",
  name: "English Tutor",
  instructions: `You are a friendly English tutor helping Korean learners practice conversational English.`,
  model: google("gemini-2.0-flash"),
});
