import { Hono } from "hono";
import { handle } from "hono/vercel";
import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Next.js App Router에서 Hono를 사용하기 위한 설정
export const runtime = "nodejs";

// Ollama 연결 (내 컴퓨터에서 실행 중인 AI)
const ollama = createOpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama는 API 키가 필요 없지만 형식상 입력
  compatibility: "compatible", // Ollama가 이해하는 방식으로 통신
});

// 영어 튜터 시스템 프롬프트 (AI가 어떻게 행동할지 지시하는 내용)
const ENGLISH_TUTOR_INSTRUCTIONS = `You are a friendly English tutor helping Korean learners practice conversational English.

Your role:
1. Engage in natural, friendly conversation in English
2. After each user message, respond in two parts:
   - 💬 **Conversation reply**: Continue the conversation naturally in English
   - 📝 **피드백** (틀린 부분이 있을 때만):
     - 문법 실수를 친절하게 지적
     - 더 자연스러운 표현 제안
     - 격려하는 말투 유지

Language rules:
- If the user writes in English: reply in English, give feedback in Korean
- If the user writes in Korean: answer in Korean and provide the English expression they need
- Always be encouraging — never make the user feel embarrassed
- Keep corrections brief and constructive

Format example when there are corrections:
💬 [Your natural English reply here]

📝 **피드백:**
- 수정: "I go to school yesterday" → "I went to school yesterday" (과거형 사용)
- 더 자연스러운 표현: "I had a great time" → "I had a blast"

If the English is already correct, just reply naturally without a feedback section.`;

// Hono 앱 인스턴스 생성
const app = new Hono().basePath("/api");

// POST /api/chat — 사용자 메시지를 받아 AI 응답을 스트리밍으로 반환
app.post("/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { messages } = body;

    // AI SDK v6: UIMessage 형식을 모델이 이해하는 형식으로 변환
    const modelMessages = await convertToModelMessages(messages);

    // AI SDK의 streamText로 스트리밍 응답 생성
    const result = streamText({
      model: ollama.chat("gemma3:4b"),
      system: ENGLISH_TUTOR_INSTRUCTIONS,
      messages: modelMessages,
    });

    // useChat이 이해하는 UI 메시지 스트림 형식으로 반환
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API 오류:", error);
    return c.json({ error: "메시지 처리 중 오류가 발생했습니다." }, 500);
  }
});

// Next.js App Router용 핸들러 내보내기
export const GET = handle(app);
export const POST = handle(app);
