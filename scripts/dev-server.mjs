// 개발용 정적 서버
//
// 왜 따로 두는가 —
// 브라우저는 한 번 받은 파일을 기억해 둡니다. 보통은 고마운 일이지만, 개발 중에는
// 코드를 고쳐도 옛 파일이 계속 돌아 "고쳤는데 화면이 그대로"인 상황을 만듭니다.
// 특히 서로를 불러오는 모듈 파일에서 잘 생깁니다. 새로고침으로도 안 풀릴 때가 있어
// 원인을 찾는 데 시간을 다 씁니다.
//
// 그래서 이 서버는 모든 응답에 "저장하지 마"를 붙입니다.
// 실제 배포(Vercel)와는 무관하고, 개발할 때만 씁니다.
//
// 실행:  node scripts/dev-server.mjs
//        (포트를 바꾸려면)  PORT=3000 node scripts/dev-server.mjs

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT || 8765);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  // 서버리스 함수(api/)는 이 서버가 실행하지 못합니다. 조용히 실패하지 않고 그렇게 말합니다.
  if (url.startsWith("/api/")) {
    res.writeHead(501, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(
      JSON.stringify({
        error:
          "개발용 서버는 api/ 함수를 실행하지 못합니다. 'vercel dev' 로 띄우거나 배포된 주소에서 확인하세요.",
      })
    );
  }

  // 상위 폴더로 빠져나가는 경로를 막습니다.
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, safe === "/" ? "index.html" : safe);

  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");

    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      // 이 한 줄이 이 파일의 존재 이유입니다.
      "Cache-Control": "no-store, no-cache, must-revalidate",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("찾을 수 없습니다: " + url);
  }
}).listen(PORT, () => {
  console.log(`개발 서버가 떴습니다 → http://localhost:${PORT}`);
  console.log(`브라우저가 파일을 기억하지 않으므로, 고치고 새로고침하면 바로 반영됩니다.`);
});
