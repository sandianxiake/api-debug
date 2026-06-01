// PDF 解析工具
import * as pdfjsLib from 'pdfjs-dist';

// 设置 worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParseResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * 从 PDF 文件提取文本内容
 */
export async function extractTextFromPdf(file: File): Promise<ParseResult> {
  try {
    // 验证文件类型
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return {
        success: false,
        text: '',
        error: '请上传 PDF 格式的文件'
      };
    }

    // 读取文件
    const arrayBuffer = await file.arrayBuffer();
    
    // 解析 PDF
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise;

    // 提取每页文本
    const texts: string[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      
      // 提取文本，处理换行
      const pageText = content.items
        .map((item: any) => item.str)
        .join('')
        .split(/\s{2,}/)  // 多个空格分割
        .join('\n');
      
      texts.push(pageText);
    }

    const fullText = texts.join('\n\n');

    // 检查是否提取到有效文本
    if (!fullText.trim()) {
      return {
        success: false,
        text: '',
        error: 'PDF 解析失败：无法提取文本内容。可能是扫描件或加密 PDF'
      };
    }

    return {
      success: true,
      text: fullText
    };

  } catch (error) {
    console.error('PDF 解析错误:', error);
    return {
      success: false,
      text: '',
      error: 'PDF 解析失败，请尝试其他方式输入接口文档'
    };
  }
}
