<script setup lang="ts">
import { computed, ref } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import type { ParsedCode } from '../utils/codeParser';

const props = defineProps<{
  code: ParsedCode;
}>();

const copied = ref(false);

// 高亮代码
const highlighted = computed(() => {
  if (!props.code.content) return '';
  try {
    return hljs.highlight(props.code.content, { language: 'typescript' }).value;
  } catch {
    return props.code.content;
  }
});

// 复制代码
async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code.content);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
  }
}

// 获取文件名
const fileName = computed(() => {
  const parts = props.code.filePath.split('/');
  return parts[parts.length - 1];
});

const folderPath = computed(() => {
  const parts = props.code.filePath.split('/');
  parts.pop();
  return parts.join('/');
});
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <div class="file-info">
        <span class="folder-path">{{ folderPath }}/</span>
        <span class="file-name">{{ fileName }}</span>
      </div>
      <button class="copy-btn" @click="copyCode" :class="{ copied }">
        {{ copied ? '已复制!' : '复制代码' }}
      </button>
    </div>
    <pre class="code-content"><code ref="codeRef" v-html="highlighted"></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #1e1e1e;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.folder-path {
  color: #888;
}

.file-name {
  color: #e5e7eb;
  font-weight: 500;
}

.copy-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  background: #3d3d3d;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #4a4a4a;
}

.copy-btn.copied {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.code-content {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  background: #1e1e1e;
}

.code-content code {
  font-family: 'Fira Code', 'Consolas', monospace;
}
</style>
