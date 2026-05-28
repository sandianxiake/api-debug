// 代码块解析工具

export interface ParsedCode {
  filePath: string;
  language: string;
  content: string;
}

export interface ParsedResult {
  types: ParsedCode[];
  api: ParsedCode[];
  mock: ParsedCode[];
  mockIndex: ParsedCode[];
  raw: string;
}

/**
 * 解析 LLM 返回的 Markdown 内容，提取代码块
 */
export function parseCodeBlocks(markdown: string): ParsedResult {
  const result: ParsedResult = {
    types: [],
    api: [],
    mock: [],
    mockIndex: [],
    raw: markdown
  };

  // 正则匹配 ```typescript:文件路径 或 ```tsx:文件路径 等格式
  const codeBlockRegex = /```(?:typescript|tsx|javascript|js)\s*:[^\n]+\n([\s\S]*?)```/g;
  
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const fullMatch = match[0];
    const content = match[1];
    
    // 提取文件路径
    const pathMatch = fullMatch.match(/```[^\s]+:\s*([^\n]+)/);
    const filePath = pathMatch ? pathMatch[1].trim() : 'unknown.ts';
    
    const code: ParsedCode = {
      filePath,
      language: 'typescript',
      content: content.trim()
    };

    // 根据路径分类
    if (filePath.includes('/types/') || filePath.includes('/types\\')) {
      result.types.push(code);
    } else if (filePath.includes('/api/') || filePath.includes('/api\\')) {
      result.api.push(code);
    } else if (filePath.includes('/mock/') || filePath.includes('/mock\\')) {
      if (filePath.includes('index')) {
        result.mockIndex.push(code);
      } else {
        result.mock.push(code);
      }
    } else {
      // 无法分类的默认放入 types
      result.types.push(code);
    }
  }

  return result;
}

/**
 * 按文件路径分组代码块
 */
export function groupByFile(parsed: ParsedResult): Map<string, ParsedCode[]> {
  const groups = new Map<string, ParsedCode[]>();
  
  const allCodes = [...parsed.types, ...parsed.api, ...parsed.mock, ...parsed.mockIndex];
  
  for (const code of allCodes) {
    const existing = groups.get(code.filePath) || [];
    existing.push(code);
    groups.set(code.filePath, existing);
  }
  
  return groups;
}
