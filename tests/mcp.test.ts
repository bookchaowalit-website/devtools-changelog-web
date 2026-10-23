import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/mcp/route";

function rpc(body: unknown) {
  return POST(new Request("http://localhost/api/mcp", { method: "POST", body: JSON.stringify(body) }));
}

describe("MCP route", () => {
  it("echoes the JSON-RPC request id", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 7, method: "tools/list" });
    expect((await res.json()).id).toBe(7);
  });

  it("lists no tools: the changelog lives in each visitor's browser", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    expect((await res.json()).result.tools).toEqual([]);
  });

  it("rejects a tool call instead of echoing it back as if it ran", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "get_all" } });
    const body = await res.json();
    expect(body.result).toBeUndefined();
    expect(body).toMatchObject({ id: 4, error: { code: -32602 } });
  });

  it("unknown methods and bad JSON are JSON-RPC errors", async () => {
    const unknown = await (await rpc({ jsonrpc: "2.0", id: "x", method: "resources/list" })).json();
    expect(unknown).toMatchObject({ id: "x", error: { code: -32601 } });
    const res = await POST(new Request("http://localhost/api/mcp", { method: "POST", body: "{" }));
    expect((await res.json()).error.code).toBe(-32700);
  });

  it("initialize names the server", async () => {
    const init = await (await rpc({ jsonrpc: "2.0", id: 2, method: "initialize" })).json();
    expect(init.result.serverInfo.name).toBe("Changelog");
  });
});
