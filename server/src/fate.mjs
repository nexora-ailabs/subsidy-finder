// 1FATE MCP 도구를 호출하는 클라이언트. 연결은 한 번 맺고 재사용하며, 끊어지면 다음 호출에서 다시 연결한다.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.FATE_MCP_URL;
const MCP_TOKEN = process.env.FATE_MCP_TOKEN;
// PlayMCP를 거치면 도구 이름 앞에 "1fate-"가 붙고, 1FATE 서버에 직접 붙으면 접두사가 없다
const TOOL_PREFIX = process.env.FATE_TOOL_PREFIX ?? "1fate-";

let clientPromise = null;

async function connect() {
  if (!MCP_URL) throw new Error("FATE_MCP_URL이 설정되지 않았어요");
  const headers = MCP_TOKEN ? { Authorization: `Bearer ${MCP_TOKEN}` } : {};
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), { requestInit: { headers } });
  const client = new Client({ name: "check-my-saju-proxy", version: "1.0.0" });
  transport.onclose = () => {
    clientPromise = null;
  };
  await client.connect(transport);
  return client;
}

function getClient() {
  if (!clientPromise) {
    clientPromise = connect().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

export class FateError extends Error {}

// 도구를 호출하고 JSON 결과의 result 부분을 돌려준다. 도구가 {error}를 돌려주면 FateError로 던진다.
export async function callFate(tool, args) {
  let client;
  try {
    client = await getClient();
  } catch (err) {
    throw new FateError(`1FATE 연결 실패: ${err.message}`);
  }

  let res;
  try {
    res = await client.callTool({ name: `${TOOL_PREFIX}${tool}`, arguments: args });
  } catch (err) {
    clientPromise = null; // 세션이 깨졌을 수 있으니 다음 호출에서 다시 연결
    throw new FateError(`1FATE 호출 실패: ${err.message}`);
  }

  const payload = res.structuredContent ?? parseText(res.content);
  if (res.isError || !payload) throw new FateError(`1FATE 오류: ${textOf(res.content) || "응답이 비어 있어요"}`);
  if (payload.error) throw new FateError(`1FATE 오류: ${payload.error}`);
  return payload.result ?? payload;
}

function textOf(content) {
  return (content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

function parseText(content) {
  const text = textOf(content);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}
