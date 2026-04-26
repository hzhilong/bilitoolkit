import { parentPort as s, workerData as b } from "node:worker_threads";
import f from "node:vm";
import p from "node:util";
function d(t) {
  if (t === null || typeof t != "object") return !1;
  const e = Object.getPrototypeOf(t);
  return e === Object.prototype || e === null;
}
function a(t, e = /* @__PURE__ */ new WeakMap()) {
  if (typeof t == "function") return;
  if (t === null || typeof t != "object" || t instanceof Date || t instanceof RegExp || t instanceof Map || t instanceof Set || ArrayBuffer.isView(t) || t instanceof ArrayBuffer)
    return t;
  if (e.has(t))
    return e.get(t);
  if (Array.isArray(t)) {
    const o = [];
    e.set(t, o);
    for (const i of t)
      o.push(a(i, e));
    return o;
  }
  if (!d(t))
    return t;
  const r = {};
  e.set(t, r);
  for (const [o, i] of Object.entries(t)) {
    if (typeof i == "function") continue;
    const c = a(i, e);
    c !== void 0 && (r[o] = c);
  }
  return r;
}
function m(t) {
  return t instanceof Error ? {
    name: t.name,
    message: t.message,
    stack: t.stack
  } : {
    name: "Error",
    message: String(t)
  };
}
if (!s)
  throw new Error("task-plugin.worker must run in a worker thread");
function h(...t) {
  return t.map((e) => typeof e == "string" ? e : p.inspect(e, { depth: null, colors: !1 })).join(" ");
}
const l = /* @__PURE__ */ new Map();
s.on("message", (t) => {
  if (t?.type !== "rpc:api:result") return;
  const e = l.get(t.callId);
  e && (l.delete(t.callId), t.ok ? e.resolve(t.value) : e.reject(Object.assign(new Error(t.error.message), t.error)));
});
function T(t, e) {
  return new Promise((r, o) => {
    const i = crypto.randomUUID();
    l.set(i, { resolve: r, reject: o }), s.postMessage({
      type: "rpc:api:call",
      callId: i,
      path: t,
      args: e
    });
  });
}
function u(t = []) {
  const e = function() {
  };
  return new Proxy(e, {
    get(r, o) {
      if (!(o === "then" || o === "catch" || o === "finally"))
        return o === Symbol.toStringTag ? "RemoteApi" : u([...t, String(o)]);
    },
    apply(r, o, i) {
      return T(t, i);
    },
    construct() {
      throw new Error("Remote API cannot be used with new");
    }
  });
}
function y() {
  const t = (r) => (...o) => {
    s.postMessage({
      type: "rpc:log:call",
      logLevel: r,
      data: h(...o)
    });
  }, e = ["debug", "error", "warn", "info"].map((r) => [r, t(r)]);
  return Object.fromEntries(e);
}
const g = b, n = {
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
n.exports = n.module.exports;
n.global = n;
n.globalThis = n;
n.taskContext = {
  ...g.taskContext,
  logger: y(),
  api: u()
};
const w = f.createContext(n, {
  codeGeneration: {
    strings: !1,
    // 想允许 eval / new Function 就改成 true
    wasm: !1
  }
});
async function x() {
  try {
    new f.Script(g.code, {
      filename: "task-plugin.js"
    }).runInContext(w);
    const e = n.module.exports?.run;
    if (typeof e != "function")
      throw new Error("插件必须导出 run 异步函数");
    const r = await Reflect.apply(e, n.module.exports, [n.taskContext]);
    s.postMessage({
      type: "done",
      result: a(r)
    });
  } catch (t) {
    console.error(t), s.postMessage({
      type: "error",
      error: m(t)
    });
  }
}
x();
