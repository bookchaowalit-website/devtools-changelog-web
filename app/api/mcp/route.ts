import { NextResponse } from "next/server";

// Stateless JSON-RPC MCP endpoint. The changelog entries live in each visitor's browser, so the server has no data to
// expose: it lists no tools and rejects every call instead of pretending to run one.

type RpcRequest = { id?: number | string | null; method?: string; params?: { name?: string } };

export async function POST(request: Request) {
  let id: RpcRequest["id"] = null;
  try {
    const body = (await request.json()) as RpcRequest;
    id = body.id ?? null;
    switch (body.method) {
      case "initialize":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "Changelog", version: "1.0.0" } },
        });
      case "tools/list":
        return NextResponse.json({ jsonrpc: "2.0", id, result: { tools: [] } });
      case "tools/call":
        return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `Unknown tool: ${String(body.params?.name)}` } }, { status: 400 });
      default:
        return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown method: ${String(body.method)}` } }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }
}
