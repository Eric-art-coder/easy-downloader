import { ref } from 'vue'
import { ElLoading } from 'element-plus'
import { ipcRenderer } from 'electron'

export function useUIState() {
  const isInitApp = ref(false)
  const loading = ref<ReturnType<typeof ElLoading.service> | null>(null)
  const tableHeight = ref(400)

  const handleResize = () => {
    const height = document.documentElement.clientHeight || window.innerHeight
    tableHeight.value = height - 115
  }

  const handleInitApp = () => {
    ipcRenderer.invoke('invoke_app_is_init').then((isInit: boolean) => {
      if (isInit) {
        isInitApp.value = false
      } else {
        ipcRenderer.invoke('invoke_init_app')
      }
    })
  }

  return {
    isInitApp,
    loading,
    tableHeight,
    handleResize,
    handleInitApp
  }
}
