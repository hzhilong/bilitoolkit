import { parentPort as l, workerData as b } from "node:worker_threads";
import u from "node:vm";
import p from "node:util";
function d(e) {
  if (e === null || typeof e != "object") return !1;
  let t = Object.getPrototypeOf(e);
  return t === Object.prototype || t === null;
}
function i(e, t = /* @__PURE__ */ new WeakMap()) {
  if (typeof e == "function") return;
  if (e === null || typeof e != "object" || e instanceof Date || e instanceof RegExp || e instanceof Map || e instanceof Set || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) return e;
  if (t.has(e)) return t.get(e);
  if (Array.isArray(e)) {
    let o = [];
    t.set(e, o);
    for (let n of e) o.push(i(n, t));
    return o;
  }
  if (!d(e)) return e;
  let r = {};
  t.set(e, r);
  for (let [o, n] of Object.entries(e)) {
    if (typeof n == "function") continue;
    let c = i(n, t);
    c !== void 0 && (r[o] = c);
  }
  return r;
}
function m(e) {
  return e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : { name: "Error", message: String(e) };
}
if (!l)
  throw new Error("task-plugin.worker must run in a worker thread");
function h(...e) {
  return e.map((t) => typeof t == "string" ? t : p.inspect(t, { depth: null, colors: !1 })).join(" ");
}
const s = /* @__PURE__ */ new Map();
l.on("message", (e) => {
  if (e?.type !== "rpc:api:result") return;
  const t = s.get(e.callId);
  t && (s.delete(e.callId), e.ok ? t.resolve(e.value) : t.reject(Object.assign(new Error(e.error.message), e.error)));
});
function T(e, t) {
  return new Promise((r, o) => {
    const n = crypto.randomUUID();
    s.set(n, { resolve: r, reject: o }), l.postMessage({
      type: "rpc:api:call",
      callId: n,
      path: e,
      args: t
    });
  });
}
function f(e = []) {
  const t = function() {
  };
  return new Proxy(t, {
    get(r, o) {
      if (!(o === "then" || o === "catch" || o === "finally"))
        return o === Symbol.toStringTag ? "RemoteApi" : f([...e, String(o)]);
    },
    apply(r, o, n) {
      return T(e, n);
    },
    construct() {
      throw new Error("Remote API cannot be used with new");
    }
  });
}
function y() {
  const e = (r) => (...o) => {
    l.postMessage({
      type: "rpc:log:call",
      logLevel: r,
      data: h(...o)
    });
  }, t = ["debug", "error", "warn", "info"].map((r) => [r, e(r)]);
  return Object.fromEntries(t);
}
const g = b, a = {
  // ===== 基础 =====
  console,
  // ===== Web API（Node 18+）=====
  fetch: globalThis.fetch?.bind(globalThis),
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Blob: globalThis.Blob,
  File: globalThis.File,
  FormData: globalThis.FormData,
  URL,
  URLSearchParams,
  TextEncoder,
  TextDecoder,
  atob: globalThis.atob,
  btoa: globalThis.btoa,
  crypto: globalThis.crypto,
  AbortController,
  AbortSignal,
  // ===== 定时器 =====
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  setInterval: globalThis.setInterval.bind(globalThis),
  clearInterval: globalThis.clearInterval.bind(globalThis),
  setImmediate: globalThis.setImmediate.bind(globalThis),
  clearImmediate: globalThis.clearImmediate.bind(globalThis),
  queueMicrotask: globalThis.queueMicrotask.bind(globalThis),
  // ===== 结构化克隆 =====
  structuredClone: globalThis.structuredClone?.bind(globalThis),
  // ===== Node 常用 =====
  Buffer,
  module: { exports: {} },
  exports: {},
  require: void 0,
  process: void 0,
  __dirname: void 0,
  __filename: void 0
};
a.exports = a.module.exports;
a.global = a;
a.globalThis = a;
a.taskContext = {
  ...g.taskContext,
  logger: y(),
  api: f()
};
const w = u.createContext(a, {
  codeGeneration: {
    strings: !1,
    // 想允许 eval / new Function 就改成 true
    wasm: !1
  }
});
async function x() {
  try {
    new u.Script(g.code, {
      filename: "task-plugin.js"
    }).runInContext(w);
    const t = a.module.exports, o = (t?.default ?? t)?.run;
    if (typeof o != "function")
      throw new Error("插件必须导出 run 异步函数");
    const n = await Reflect.apply(o, a.module.exports, [a.taskContext]);
    l.postMessage({
      type: "done",
      result: i(n)
    });
  } catch (e) {
    console.error(e), l.postMessage({
      type: "error",
      error: m(e)
    });
  }
}
x();
