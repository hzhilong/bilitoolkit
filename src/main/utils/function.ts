/**
 * 动态调用
 * @param root  对象
 * @param path  调用路径
 * @param args  参数
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export function dynamicCall<T = any>(root: any, path: string, ...args: any[]): T {
  const segments = path.split('.')
  let context = root
  let i = 0
  for (; i < segments.length - 1; i++) {
    context = context[segments[i]]
    if (context == null) {
      throw new Error(`Path '${segments.slice(0, i + 1).join('.')}' is null/undefined`)
    }
  }
  const fn = context[segments[i]]
  if (typeof fn !== 'function') {
    throw new Error(`'${path}' is not a function`)
  }
  return fn.apply(context, args)
}
