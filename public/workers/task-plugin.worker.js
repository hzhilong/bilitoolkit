import { parentPort as s, workerData as p } from "node:worker_threads";
import u from "node:vm";
import d from "node:util";
function m(e) {
  return typeof e == "string" ? e : e instanceof Error || e && typeof e == "object" && "message" in e && typeof e.message == "string" ? e.message : String(e) ?? "未知错误";
}
function h(e) {
  if (e === null || typeof e != "object") return !1;
  let o = Object.getPrototypeOf(e);
  return o === Object.prototype || o === null;
}
function i(e, o = /* @__PURE__ */ new WeakMap()) {
  if (typeof e == "function") return;
  if (e === null || typeof e != "object" || e instanceof Date || e instanceof RegExp || e instanceof Map || e instanceof Set || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) return e;
  if (o.has(e)) return o.get(e);
  if (Array.isArray(e)) {
    let r = [];
    o.set(e, r);
    for (let n of e) r.push(i(n, o));
    return r;
  }
  if (!h(e)) return e;
  let t = {};
  o.set(e, t);
  for (let [r, n] of Object.entries(e)) {
    if (typeof n == "function") continue;
    let c = i(n, o);
    c !== void 0 && (t[r] = c);
  }
  return t;
}
function f(e) {
  return e instanceof Error ? { name: e.name, message: e.message, stack: e.stack, cause: "cause" in e && e.cause ? f(e.cause) : void 0 } : { name: "UnknownError", message: m(e) };
}
if (!s)
  throw new Error("task-plugin.worker must run in a worker thread");
function T(...e) {
  return e.map((o) => typeof o == "string" ? o : d.inspect(o, { depth: null, colors: !1 })).join(" ");
}
const l = /* @__PURE__ */ new Map();
s.on("message", (e) => {
  if (e?.type !== "rpc:api:result") return;
  const o = l.get(e.callId);
  o && (l.delete(e.callId), e.ok ? o.resolve(e.value) : o.reject(Object.assign(new Error(e.error.message), e.error)));
});
function y(e, o) {
  return new Promise((t, r) => {
    const n = crypto.randomUUID();
    l.set(n, { resolve: t, reject: r }), s.postMessage({
      type: "rpc:api:call",
      callId: n,
      path: e,
      args: o
    });
  });
}
function g(e = []) {
  const o = function() {
  };
  return new Proxy(o, {
    get(t, r) {
      if (!(r === "then" || r === "catch" || r === "finally"))
        return r === Symbol.toStringTag ? "RemoteApi" : g([...e, String(r)]);
    },
    apply(t, r, n) {
      return y(e, n);
    },
    construct() {
      throw new Error("Remote API cannot be used with new");
    }
  });
}
function w() {
  const e = (t) => (...r) => {
    s.postMessage({
      type: "rpc:log:call",
      logLevel: t,
      data: T(...r)
    });
  }, o = ["debug", "error", "warn", "info"].map((t) => [t, e(t)]);
  return Object.fromEntries(o);
}
const b = p, a = {
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
  ...b.taskContext,
  logger: w(),
  api: g()
};
const x = u.createContext(a, {
  codeGeneration: {
    strings: !1,
    // 想允许 eval / new Function 就改成 true
    wasm: !1
  }
});
async function k() {
  try {
    new u.Script(b.code, {
      filename: "task-plugin.js"
    }).runInContext(x);
    const o = a.module.exports, r = (o?.default ?? o)?.run;
    if (typeof r != "function")
      throw new Error("插件必须导出 run 异步函数");
    const n = await Reflect.apply(r, a.module.exports, [a.taskContext]);
    s.postMessage({
      type: "done",
      result: i(n)
    });
  } catch (e) {
    console.error(e), s.postMessage({
      type: "error",
      error: f(e)
    });
  }
}
k();
