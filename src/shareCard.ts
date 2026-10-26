// 결과를 인스타 스토리 비율(1080x1920) 이미지로 그린다. 외부 라이브러리 없이 Canvas만 쓴다.

export interface ShareCardContent {
  emoji: string;
  badge: string;
  title: string;
  subtitle?: string;
  lines: string[];
  footer?: string;
  theme?: "pink" | "lavender" | "mint";
}

const THEMES = {
  pink: { top: "#ffe3ec", bottom: "#fff6f9", accent: "#ff5c8a" },
  lavender: { top: "#ece4ff", bottom: "#faf7ff", accent: "#7b5cff" },
  mint: { top: "#dcf5ea", bottom: "#f5fcf8", accent: "#13b07a" },
};

const FONT = '"Jua", "Pretendard Variable", Pretendard, sans-serif';
const BODY_FONT = '"Pretendard Variable", Pretendard, sans-serif';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderShareCard(content: ShareCardContent): Promise<string> {
  // 웹폰트는 글자 단위로 나눠 받으므로, 그릴 글자를 미리 불러와야 캔버스에 대체 폰트가 섞이지 않는다
  const allText = [content.badge, content.title, content.subtitle ?? "", ...content.lines, "내 사주를 알아볼까요?"].join("");
  try {
    await Promise.all([document.fonts.load(`96px "Jua"`, allText), document.fonts.load(`600 46px "Pretendard Variable"`, allText)]);
  } catch {
    // 폰트를 못 불러와도 기본 폰트로 그린다
  }
  await document.fonts?.ready;
  const W = 1080;
  const H = 1920;
  const theme = THEMES[content.theme ?? "pink"];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, theme.top);
  bg.addColorStop(1, theme.bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 반짝이 장식
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `60px ${BODY_FONT}`;
  ctx.textAlign = "center";
  [
    [140, 260, "✦"],
    [930, 380, "♡"],
    [110, 1180, "✧"],
    [960, 1500, "✦"],
  ].forEach(([x, y, s]) => ctx.fillText(String(s), Number(x), Number(y)));

  // 이모지 원
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W / 2, 470, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `150px ${BODY_FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillText(content.emoji, W / 2, 480);

  // 배지
  ctx.font = `bold 40px ${BODY_FONT}`;
  const badgeW = ctx.measureText(content.badge).width + 80;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, (W - badgeW) / 2, 680, badgeW, 76, 38);
  ctx.fill();
  ctx.fillStyle = theme.accent;
  ctx.fillText(content.badge, W / 2, 720);

  // 제목
  ctx.fillStyle = "#2b2230";
  ctx.font = `96px ${FONT}`;
  let y = 880;
  for (const line of wrap(ctx, content.title, W - 160)) {
    ctx.fillText(line, W / 2, y);
    y += 116;
  }

  if (content.subtitle) {
    ctx.fillStyle = "#6b5a63";
    ctx.font = `500 44px ${BODY_FONT}`;
    for (const line of wrap(ctx, content.subtitle, W - 200)) {
      ctx.fillText(line, W / 2, y + 10);
      y += 64;
    }
  }

  // 내용 카드
  const cardTop = Math.max(y + 60, 1180);
  const lineHeight = 70;
  ctx.font = `600 44px ${BODY_FONT}`;
  // 긴 줄은 카드 폭에 맞춰 줄바꿈하고, 하단 문구와 겹치지 않게 최대 6줄까지만 그린다
  const wrapped = content.lines.flatMap((line) => wrap(ctx, line, W - 280)).slice(0, 6);
  const cardH = wrapped.length * lineHeight + 100;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  roundRect(ctx, 90, cardTop, W - 180, cardH, 56);
  ctx.fill();
  ctx.fillStyle = "#2b2230";
  wrapped.forEach((line, i) => {
    ctx.fillText(line, W / 2, cardTop + 85 + i * lineHeight);
  });

  // 하단
  ctx.fillStyle = theme.accent;
  ctx.font = `56px ${FONT}`;
  ctx.fillText("내 사주를 알아볼까요? 🐯", W / 2, H - 200);
  ctx.fillStyle = "#a6929b";
  ctx.font = `500 34px ${BODY_FONT}`;
  ctx.fillText(content.footer ?? "토스에서 '내 사주를 알아볼까요' 검색", W / 2, H - 130);

  return canvas.toDataURL("image/png");
}
