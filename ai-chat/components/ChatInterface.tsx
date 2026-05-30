"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";

// 메시지 말풍선 컴포넌트
function MessageBubble({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* AI 아바타 (사용자 메시지엔 표시 안 함) */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold shrink-0 mb-1">
          AI
        </div>
      )}

      {/* 말풍선 */}
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? "bg-yellow-300 text-gray-900 rounded-br-sm"
            : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}

// 메인 채팅 인터페이스 컴포넌트
export default function ChatInterface() {
  const { messages, sendMessage, status, error, setMessages } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  // 새 메시지 또는 에러 발생 시 자동으로 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, error]);

  // 메시지 전송 처리
  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;

    sendMessage({ text });
    setInput("");

    // 입력창 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // 텍스트 입력 시 textarea 높이 자동 조절
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // Enter 키로 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-[#b2c7d9]">
      {/* 상단 헤더 */}
      <header className="bg-[#3c5a78] text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold">
          AI
        </div>
        <div>
          <p className="font-semibold text-sm">English Tutor</p>
          <p className="text-xs text-blue-200">영어 학습 AI 도우미</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("대화 내용을 모두 지울까요?")) setMessages([]);
            }}
            className="ml-auto text-xs text-blue-200 hover:text-white border border-blue-400 hover:border-white rounded-lg px-2.5 py-1 transition-colors"
          >
            새 대화
          </button>
        )}
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto px-3 py-4">
        {/* 시작 안내 메시지 */}
        {messages.length === 0 && (
          <div className="text-center mt-8 space-y-2">
            <div className="bg-white/60 rounded-xl px-4 py-3 inline-block text-sm text-gray-700 max-w-xs">
              👋 안녕하세요! 영어로 자유롭게 말을 걸어보세요.
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                틀려도 괜찮아요. 교정해 드릴게요! 😊
              </span>
            </div>
          </div>
        )}

        {/* 대화 메시지 목록 */}
        {messages.map((m) => {
          // 각 메시지의 텍스트 파트만 추출해서 표시
          const textContent = m.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("");

          if (!textContent || (m.role !== "user" && m.role !== "assistant")) return null;

          return (
            <MessageBubble
              key={m.id}
              role={m.role as "user" | "assistant"}
              text={textContent}
            />
          );
        })}

        {/* AI 응답 로딩 표시 */}
        {isLoading && (
          <div className="flex items-end gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold shrink-0">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="text-center my-2">
            <span className="bg-red-100 text-red-600 text-xs rounded-lg px-3 py-1.5 inline-block">
              오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </span>
          </div>
        )}

        {/* 스크롤 위치 기준점 */}
        <div ref={bottomRef} />
      </main>

      {/* 하단 입력 영역 */}
      <footer className="bg-[#3c5a78] px-3 py-2 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="영어로 말해보세요... (Enter로 전송)"
            rows={1}
            className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 min-h-[40px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
          >
            <svg
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-blue-200 mt-1.5">
          Shift+Enter로 줄바꿈
        </p>
      </footer>
    </div>
  );
}
