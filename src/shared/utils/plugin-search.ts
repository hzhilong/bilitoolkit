import type { ToolkitPlugin } from '../types/toolkit-plugin.js'

export function matchesPluginSearch(plugin: Pick<ToolkitPlugin, 'id' | 'name' | 'description'>, query: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const text = `${plugin.name} ${plugin.id} ${plugin.description}`.toLocaleLowerCase()
  return terms.every((term) => text.includes(term))
}
