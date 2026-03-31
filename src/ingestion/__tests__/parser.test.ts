import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../parser'

describe('parser', () => {
  it('parses simple markdown into a valid AST', () => {
    const ast = parseMarkdown('# Hello\n\nWorld')
    expect(ast.type).toBe('root')
    expect(ast.children.length).toBeGreaterThan(0)
  })

  it('parses YAML frontmatter', () => {
    const ast = parseMarkdown('---\ntitle: Test\n---\n\nBody')
    const yamlNode = ast.children.find((n) => n.type === 'yaml')
    expect(yamlNode).toBeDefined()
  })

  it('parses GFM tables', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |'
    const ast = parseMarkdown(md)
    const tableNode = ast.children.find((n) => n.type === 'table')
    expect(tableNode).toBeDefined()
  })

  it('parses empty string without crashing', () => {
    const ast = parseMarkdown('')
    expect(ast.type).toBe('root')
    expect(ast.children).toHaveLength(0)
  })

  it('parses markdown without frontmatter', () => {
    const ast = parseMarkdown('# Title\n\nContent')
    const yamlNode = ast.children.find((n) => n.type === 'yaml')
    expect(yamlNode).toBeUndefined()
  })
})
