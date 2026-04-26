export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripFunctions<T>(value: T, seen = new WeakMap<object, any>()): T {
  if (typeof value === 'function') return undefined as T
  if (value === null || typeof value !== 'object') return value

  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    ArrayBuffer.isView(value) ||
    value instanceof ArrayBuffer
  ) {
    return value
  }

  if (seen.has(value as object)) {
    return seen.get(value as object)
  }

  if (Array.isArray(value)) {
    const out: unknown[] = []
    seen.set(value as object, out)
    for (const item of value) {
      out.push(stripFunctions(item, seen))
    }
    return out as T
  }

  if (!isPlainObject(value)) {
    return value
  }

  const out: Record<string, unknown> = {}
  seen.set(value as object, out)

  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'function') continue
    const next = stripFunctions(item, seen)
    if (next !== undefined) out[key] = next
  }

  return out as T
}

export function serializeError(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  }

  return {
    name: 'Error',
    message: String(err),
  }
}
