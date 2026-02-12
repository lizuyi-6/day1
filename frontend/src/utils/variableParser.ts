import type { VariableContext, VariableReference } from './variable'

export function parseVariableReferences(text: string): VariableReference[] {
  const regex = /\$\{([^}]+)\}/g
  const references: VariableReference[] = []
  let match

  while ((match = regex.exec(text)) !== null) {
    references.push({
      variableName: match[1],
      path: undefined
    })
  }

  return references
}

export function replaceVariables(text: string, context: VariableContext): string {
  if (!text) return ''

  return text.replace(/\$\{([^}]+)\}/g, (match, variableName) => {
    const value = getVariableValue(variableName, context)
    return value !== undefined ? String(value) : match
  })
}

export function getVariableValue(variableName: string, context: VariableContext): any {
  const parts = variableName.split('.')
  let value: any = context

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return undefined
    }
  }

  return value
}

export function buildVariableContext(nodes: any[], edges: any[]): VariableContext {
  const context: VariableContext = {}

  nodes.forEach(node => {
    if (node.data && node.data.outputs) {
      node.data.outputs.forEach((output: Variable) => {
        context[output.name] = {
          value: output.defaultValue,
          nodeId: node.id,
          nodeType: node.type
        }
      })
    }
  })

  return context
}

export function validateVariableReferences(text: string, context: VariableContext): { valid: boolean; errors: string[] } {
  const references = parseVariableReferences(text)
  const errors: string[] = []

  references.forEach(ref => {
    const value = getVariableValue(ref.variableName, context)
    if (value === undefined) {
      errors.push(`变量 "${ref.variableName}" 未定义`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
