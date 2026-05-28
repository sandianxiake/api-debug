# API Code Gen - 接口代码生成工具

## 项目概述
面向前端接口开发场景的 Web 工具，输入接口文档（Markdown/JSON/纯文本），通过 LLM 自动生成：
- TypeScript 类型定义
- Axios 请求函数
- Mock 数据
- Mock.js 路由配置

## 技术栈
- Vue3 + TypeScript + Vite
- highlight.js（代码高亮）
- DeepSeek API（LLM 调用）

## 目录结构
```
api-code-gen/
├── src/
│   ├── config/
│   │   └── prompt.ts        # LLM 系统提示词
│   ├── services/
│   │   └── deepseek.ts      # DeepSeek API 调用（含流式）
│   ├── utils/
│   │   └── codeParser.ts    # 代码块解析工具
│   ├── components/
│   │   ├── InputArea.vue    # 输入区域组件
│   │   ├── OutputArea.vue   # 输出区域组件
│   │   └── CodeBlock.vue    # 代码展示组件
│   ├── App.vue
│   └── main.ts
├── .env                      # 环境变量（API Key）
└── vite.config.ts
```

## 运行与预览
```bash
pnpm install
pnpm dev     # 开发服务器 http://localhost:5000
pnpm build   # 生产构建
```

## 核心交互流程
1. 用户在左侧输入区粘贴接口文档
2. 点击「生成代码」按钮
3. 前端调用 DeepSeek API（流式返回）
4. 右侧输出区实时展示生成的代码
5. 用户按 Tab 分段查看或一键复制

## 配置说明
API Key 配置在 `.env` 文件的 `VITE_DEEPSEEK_API_KEY` 字段
