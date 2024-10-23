import { Ref } from 'vue'
import { ipcRenderer } from 'electron'
import { ElMessage, ElLoading } from 'element-plus'
import { Resource } from '../types/resource'
import { useSettingsStore } from '../stores/settings'

export function useDownloadManager() {
  const settingsStore = useSettingsStore()

  const handleBatchDown = async () => {
    const selectedItems = settingsStore.tableData.filter(item => item.selected)
    for (const item of selectedItems) {
      await handleDown(settingsStore.tableData.indexOf(item), item)
    }
  }

  const handleDown = async (index: number, row: Resource) => {
    const save_dir = settingsStore.saveDir
    if (!save_dir) {
      ElMessage.warning('请设置保存目录')
      return
    }
    const loading = ElLoading.service({
      lock: true,
      text: '下载中',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    try {
      const serializableRow = {
        url: row.url,
        type: row.type,
        type_str: row.type_str,
        platform: row.platform,
        size: row.size,
        description: row.description,
      }

      console.log('下载参数:', {
        data: serializableRow,
        save_path: save_dir,
        quality: settingsStore.quality,
      })
      const res = await ipcRenderer.invoke('invoke_down_file', {
        data: serializableRow,
        save_path: save_dir,
        quality: settingsStore.quality,
      })
      console.log('下载结果:', res)
      if (res !== false) {
        settingsStore.tableData[index].progress_bar = "100%"
        settingsStore.tableData[index].save_path = res.fullFileName
        settingsStore.updateTableData([...settingsStore.tableData])
        ElMessage.success("下载成功")
      } else {
        ElMessage.warning("下载失败")
      }
    } catch (err) {
      console.error('下载错误:', err)
      ElMessage.warning("下载失败")
    } finally {
      loading.close()
    }
  }

  const decodeWxFile = (index: number) => {
    const loading = ElLoading.service({
      lock: true,
      text: "解密中",
      background: 'rgba(0, 0, 0, 0.7)',
    })
    ipcRenderer.invoke('invoke_select_wx_file', {
      index: index,
      data: settingsStore.tableData[index],
    }).then((res) => {
      if (res !== false) {
        ElMessage.success("解密成功: " + res.fullFileName)
        settingsStore.tableData[index].progress_bar = "100%"
        settingsStore.tableData[index].save_path = res.fullFileName
        localStorageCache.set("res-table-data", settingsStore.tableData, -1)
      } else {
        ElMessage.warning("解密失败")
      }
    }).catch(() => {
      ElMessage.warning("解密失败")
    }).finally(() => {
      loading.close()
    })
  }

  const handlePreview = (index: number, row: Resource) => {
    ipcRenderer.invoke('invoke_resources_preview', {url: row.url}).catch(() => {
      ElMessage.error('预览失败')
    })
  }

  const openFileDir = (index: number) => {
    ipcRenderer.invoke('invoke_open_file_dir', {
      save_path: settingsStore.tableData[index].save_path
    })
  }

  return {
    handleBatchDown,
    handleDown,
    decodeWxFile,
    handlePreview,
    openFileDir
  }
}
