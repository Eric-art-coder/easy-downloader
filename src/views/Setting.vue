<script setup lang="ts">
import { onMounted, ref } from "vue"
import { ipcRenderer } from "electron"
import { ElMessage } from "element-plus"
import { useSettingsStore } from "../stores/settings"
import { QUALITY_OPTIONS } from "../constants/settings"

const settingsStore = useSettingsStore()

const saveDir = ref("")
const upstreamProxy = ref("")
const quality = ref("")

onMounted(() => {
  console.log('settingsStore: ', settingsStore)
  saveDir.value = settingsStore.saveDir
  quality.value = settingsStore.quality
  upstreamProxy.value = settingsStore.upstreamProxy
})

const selectSaveDir = async () => {
  const selectedPath = await ipcRenderer.invoke('invoke_select_down_dir')
  if (selectedPath) {
    saveDir.value = selectedPath
  }
}

const saveSettings = () => {
  settingsStore.updateSettings({
    saveDir: saveDir.value,
    upstreamProxy: upstreamProxy.value,
    quality: quality.value,
  })

  if (settingsStore.isProxyChanged) {
    ipcRenderer.invoke('invoke_window_restart')
  }

  ElMessage.success("设置保存成功")
}
</script>

<template>
  <el-form class="settings-form">
    <el-form-item label="保存位置">
      <el-link @click="selectSaveDir">{{ saveDir || '选择' }}</el-link>
    </el-form-item>
    
    <el-form-item label="视频号画质">
      <el-select v-model="quality" placeholder="请选择">
        <el-option
          v-for="option in QUALITY_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="特殊代理">
      <el-input
        v-model="upstreamProxy"
        placeholder="例如: http://127.0.0.1:7890 修改此项需重启本软件，如不清楚用途请勿设置。"
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="saveSettings">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.settings-form {
  max-width: 600px;
}
</style>
