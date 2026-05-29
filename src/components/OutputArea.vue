<script setup lang="ts">
import { ref, computed } from 'vue';
import CodeBlock from './CodeBlock.vue';
import { parseCodeBlocks } from '../utils/codeParser';

const props = defineProps<{
  rawContent: string;
  isStreaming?: boolean;
}>();

const activeTab = ref<'types' | 'api' | 'mock' | 'mockIndex'>('types');

const parsed = computed(() => parseCodeBlocks(props.rawContent));

const tabs = computed(() => [
  { key: 'types', label: 'TS 类型', count: parsed.value.types.length },
  { key: 'api', label: '请求函数', count: parsed.value.api.length },
  { key: 'mock', label: 'Mock 数据', count: parsed.value.mock.length },
  { key: 'mockIndex', label: 'Mock 路由', count: parsed.value.mockIndex.length },
]);

const activeCodes = computed(() => {
  switch (activeTab.value) {
    case 'types': return parsed.value.types;
    case 'api': return parsed.value.api;
    case 'mock': return parsed.value.mock;
    case 'mockIndex': return parsed.value.mockIndex;
    default: return [];
  }
});

const allCodesFlat = computed(() => {
  return [...parsed.value.types, ...parsed.value.api, ...parsed.value.mock, ...parsed.value.mockIndex];
});

async function copyAll() {
  const text = allCodesFlat.value
    .map(c => `// ${c.filePath}\n${c.content}`)
    .join('\n\n');
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('复制失败:', err);
  }
}

function hasContent() {
  return parsed.value.types.length > 0 || 
         parsed.value.api.length > 0 || 
         parsed.value.mock.length > 0;
}
</script>

<template>
  <div class="output-area">
    <div class="output-header" v-if="hasContent()">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key, disabled: tab.count === 0 }"
          @click="tab.count > 0 && (activeTab = tab.key as any)"
        >
          {{ tab.label }}
          <span class="count" v-if="tab.count > 0">{{ tab.count }}</span>
        </button>
      </div>
      <button class="copy-all-btn" @click="copyAll">
        复制全部
      </button>
    </div>

    <div class="output-content">
      <!-- 空状态 -->
      <div v-if="!rawContent && !isStreaming" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>生成的代码将在这里展示</p>
        <p class="empty-hint">在左侧粘贴接口文档，点击「生成代码」</p>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="isStreaming && !hasContent()" class="loading-state">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>正在生成代码...</p>
      </div>

      <!-- 代码展示 -->
      <div v-else-if="hasContent()" class="codes-container">
        <CodeBlock
          v-for="(code, index) in activeCodes"
          :key="`${code.filePath}-${index}`"
          :code="code"
        />
        
        <!-- 流式输出时的原始内容 -->
        <div v-if="isStreaming && rawContent" class="streaming-preview">
          <div class="preview-header">
            <span>实时生成中...</span>
          </div>
          <pre class="preview-content">{{ rawContent }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.output-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover:not(.disabled) {
  background: #f3f4f6;
}

.tab.active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  border-radius: 10px;
  background: #e5e7eb;
}

.tab.active .count {
  background: #3b82f6;
  color: white;
}

.copy-all-btn {
  padding: 8px 16px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-all-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.output-content {
  flex: 1;
  overflow-y: auto;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 4px 0;
}

.empty-hint {
  font-size: 13px;
}

.loading-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.codes-container {
  display: flex;
  flex-direction: column;
}

.streaming-preview {
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #92400e;
}

.preview-content {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #78350f;
}
</style>
