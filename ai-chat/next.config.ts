import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run 배포를 위한 standalone 모드
  // (서버 실행에 필요한 파일만 추려서 도커 이미지 크기를 줄여줘요)
  output: "standalone",
};

export default nextConfig;
