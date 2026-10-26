// 로컬 테스트용 가짜 1FATE MCP 서버. 실제 1FATE가 돌려준 응답(2026-10-22 확인)과 같은 형식을 흉내 낸다.
// 실행: node dev/fake-1fate.mjs  →  http://localhost:8790/mcp
import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = Number(process.env.FAKE_PORT ?? 8790);
const TOKEN = process.env.FAKE_TOKEN ?? "dev-token";

const birth = {
  birth_date: z.string(),
  gender: z.enum(["male", "female"]),
  birth_time: z.string().optional(),
  calendar: z.enum(["solar", "lunar"]).optional(),
  birth_city: z.string().optional(),
};

const json = (value) => ({ content: [{ type: "text", text: JSON.stringify(value) }] });
const nick = (a, g) => `독립적인 불꽃 뱀 (${a.replaceAll("-", ".")}, 양력, ${g === "male" ? "남자" : "여자"})`;

function build() {
  const server = new McpServer({ name: "fake-1fate", version: "0.0.1" });

  server.registerTool("1fate-analyze_saju", { inputSchema: birth }, async (a) =>
    json({
      result: {
        profile: { nickname_full: nick(a.birth_date, a.gender), nickname_short: "독립적인 불꽃 뱀(여자)" },
        type_summary_ko: "화(火) 양화 - 태양의 기운을 가진 분이에요.",
        personality: {
          first_impression_ko: "밝고 따뜻한 인상",
          core_trait_ko: "열정적이고 활발한 성품, 긍정적 에너지",
          strengths_ko: "열정적이고 활발하며 표현력이 뛰어납니다",
        },
        element_tendency_ko: "火(화) 기운이 강하고, 金(금) 기운이 부족합니다.",
        supplement_hint_ko: "흰색/금색 계열, 서쪽 방향, 저녁 시간대가 도움이 됩니다",
        life_hints: {
          career_ko: "마케팅, 엔터테인먼트, 영업 등 표현력이 필요한 분야",
          relationship_ko: "활발하고 밝은 관계, 함께 성장하는 파트너십",
          health_summary_ko: "金(금) 부족에 따른 건강 관리가 필요합니다",
        },
      },
      powered_by: "1fate 호(虎)엔진",
    }),
  );

  server.registerTool("1fate-get_year_fortune", { inputSchema: { ...birth, target_year: z.number().optional() } }, async (a) =>
    json({
      result: {
        profile: { nickname_full: nick(a.birth_date, a.gender), nickname_short: "독립적인 화염 뱀(여자)" },
        target_year: a.target_year ?? 2026,
        korean_age: (a.target_year ?? 2026) - Number(a.birth_date.slice(0, 4)) + 1,
        grade_ko: "흉 (凶)",
        grade_en: "Caution",
        year_overview_ko: "신중함이 필요한 해입니다. 큰 결정은 미루고 내실을 다지는 것이 좋습니다.",
        key_themes_ko: ["인내", "신중", "정비"],
        opportunities_ko: ["내면 성찰", "역량 강화"],
        cautions_ko: ["큰 투자 자제", "건강 우선"],
        daeun_detail: { gapja: "계유", age_range_ko: "28세~37세", summary_ko: "28세에 시작된 계유 대운은 대길의 흐름입니다" },
        one_line_ko: "신중함이 필요한 해입니다.",
      },
    }),
  );

  server.registerTool(
    "1fate-check_compatibility",
    {
      inputSchema: {
        person1_birth_date: z.string(),
        person1_gender: z.enum(["male", "female"]),
        person2_birth_date: z.string(),
        person2_gender: z.enum(["male", "female"]),
        person1_birth_time: z.string().optional(),
        person2_birth_time: z.string().optional(),
        person1_calendar: z.enum(["solar", "lunar"]).optional(),
        person2_calendar: z.enum(["solar", "lunar"]).optional(),
      },
    },
    async (a) =>
      json({
        result: {
          grade: "C",
          grade_label_ko: "성장하는 인연",
          person1: {
            nickname_full: nick(a.person1_birth_date, a.person1_gender),
            ilju: "병인",
            element_ko: "火",
            trait_ko: "열정적이고 활발한 성품, 긍정적 에너지",
            impression_ko: "밝고 따뜻한 인상",
          },
          person2: {
            nickname_full: `독립적인 금속 원숭이 (${a.person2_birth_date.replaceAll("-", ".")}, 양력, 남자)`,
            ilju: "신묘",
            element_ko: "金",
            trait_ko: "섬세하고 완벽주의적 성품, 미적 감각",
            impression_ko: "세련되고 예리한 인상",
          },
          chemistry_ko: "火(화)과 金(금)의 만남",
          relation_type_ko: "상극",
          relation_desc_ko: "열정과 냉철함이 만나, 서로를 단련시키는 관계",
          strengths: [{ ko: "서로 다른 점이 매력으로 작용합니다" }],
          cautions: [{ ko: "의견 충돌이 잦을 수 있어 이해와 배려가 필요합니다" }],
          summary_ko: "서로 다른 기운이 만나 조화를 배워가는 관계입니다",
          advice_ko: "서로의 다름을 이해하려는 노력이 관계를 더 깊게 합니다",
        },
      }),
  );

  // 실제 1FATE와 똑같이 현재 오류를 낸다
  server.registerTool("1fate-get_daily_fortune", { inputSchema: birth }, async () =>
    json({ error: "일일 운세 분석 실패: name 'longitude' is not defined" }),
  );

  return server;
}

createServer(async (req, res) => {
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    res.writeHead(401).end("unauthorized");
    return;
  }
  const server = build();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res);
}).listen(PORT, () => console.log(`fake 1FATE MCP on http://localhost:${PORT}/mcp`));
