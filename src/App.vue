<script setup lang="ts">
import { ref } from 'vue';
import InputArea from './components/InputArea.vue';
import OutputArea from './components/OutputArea.vue';
import { callDeepSeek } from './services/deepseek';

const rawContent = ref('');
const isStreaming = ref(false);
const error = ref('');
const apiKey = ref(import.meta.env.VITE_DEEPSEEK_API_KEY || '');

async function handleSubmit(content: string) {
  if (!apiKey.value) {
    error.value = '请先配置 API Key';
    return;
  }

  rawContent.value = '';
  isStreaming.value = true;
  error.value = '';

  try {
    await callDeepSeek(content, {
      apiKey: apiKey.value,
      stream: true,
      onStream: (chunk) => {
        rawContent.value += chunk;
      },
      onError: (err) => {
        error.value = err.message;
      }
    });
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    isStreaming.value = false;
  }
}

// 处理 PDF 解析错误
function handleError(message: string) {
  error.value = message;
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="logo">
        <span class="logo-icon">⚡</span>
        <h1>API Code Gen</h1>
      </div>
      <div class="api-key-config">
        <input
          v-model="apiKey"
          type="password"
          placeholder="输入 DeepSeek API Key"
          class="api-key-input"
        />
      </div>
    </header>

    <main class="main">
      <div class="left-panel">
        <InputArea @submit="handleSubmit" @error="handleError" />
      </div>
      <div class="right-panel">
        <OutputArea :raw-content="rawContent" :is-streaming="isStreaming" />
      </div>
    </main>

    <footer class="footer">
      <p v-if="error" class="error">{{ error }}</p>
      <p v-else class="tip">Powered by DeepSeek + Vue3</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.api-key-config {
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-key-input {
  width: 300px;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.api-key-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 24px;
  min-height: 0;
}

.left-panel,
.right-panel {
  min-height: 0;
  overflow: hidden;
}

.footer {
  padding: 12px 24px;
  text-align: center;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.tip {
  font-size: 12px;
  color: #9ca3af;
}

.error {
  font-size: 13px;
  color: #ef4444;
}

@media (max-width: 1024px) {
  .main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
