/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  eslint: { ignoreDuringBuilds: true },
  devIndicators: false,
  htmlLimitedBots: /.*/, // 메타데이터(title)를 스트리밍하지 않고 head에 바로 렌더 (접근성: document-title)
};
export default nextConfig;
