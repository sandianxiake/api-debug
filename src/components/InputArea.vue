<script setup lang="ts">
import { ref, computed } from 'vue';
import { EXAMPLE_DOC } from '../config/prompt';
import { extractTextFromPdf } from '../utils/pdfParser';

const emit = defineEmits<{
  (e: 'submit', content: string): void;
  (e: 'error', message: string): void;
}>();

const inputContent = ref('');
const isLoading = ref(false);
const isPdfLoading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const canSubmit = computed(() => {
  return inputContent.value.trim().length > 0 && !isLoading.value;
});

// 加载示例
function loadExample() {
  inputContent.value = EXAMPLE_DOC;
}

// 清空
function clearInput() {
  inputContent.value = '';
}

// 处理提交
function handleSubmit() {
  if (canSubmit.value) {
    emit('submit', inputContent.value);
  }
}

// 触发文件选择
function triggerFileInput() {
  fileInputRef.value?.click();
}

// 处理文件上传
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  isPdfLoading.value = true;
  
  try {
    const result = await extractTextFromPdf(file);
    
    if (result.success) {
      // 替换文本框内容
      inputContent.value = result.text;
    } else {
      emit('error', result.error || 'PDF 解析失败');
    }
  } catch (error) {
    emit('error', 'PDF 解析失败，请尝试其他方式输入接口文档');
  } finally {
    isPdfLoading.value = false;
    // 清空文件选择，允许重复选择同一文件
    target.value = '';
  }
}
</script>

<template>
  <div class="input-area">
    <div class="input-header">
      <h3>接口文档</h3>
      <div class="header-actions">
        <button class="action-btn upload-btn" @click="triggerFileInput" :disabled="isPdfLoading">
          {{ isPdfLoading ? '解析中...' : '上传 PDF' }}
        </button>
        <button class="action-btn" @click="loadExample">加载示例</button>
        <button class="action-btn" @click="clearInput">清空</button>
      </div>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,application/pdf"
      class="file-input"
      @change="handleFileUpload"
    />
    
    <textarea
      v-model="inputContent"
      class="input-textarea"
      placeholder="粘贴接口文档，或上传 PDF 文件

支持以下格式：

接口名称：获取用户列表
请求地址：/api/user/list
请求方式：GET
请求参数：
  ...
响应体：
  ...

---
支持批量解析多个接口，用 --- 分隔"
      :disabled="isLoading"
    ></textarea>
    
    <div class="input-footer">
      <div class="tips">
        <span>支持 PDF / JSON / Markdown / 纯文本</span>
        <span class="separator">|</span>
        <span>最多 10 个接口/次</span>
      </div>
      <button 
        class="submit-btn" 
        @click="handleSubmit"
        :disabled="!canSubmit"
      >
        {{ isLoading ? '生成中...' : '生成代码' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.input-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-input {
  display: none;
}

.input-textarea {
  flex: 1;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Fira Code', 'Consolas', monospace;
  line-height: 1.6;
  resize: none;
  transition: border-color 0.2s;
}

.input-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-textarea::placeholder {
  color: #9ca3af;
}

.input-textarea:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.separator {
  color: #d1d5db;
}

.submit-btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>
