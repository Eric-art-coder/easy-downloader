import { ref, watch } from 'vue'
import { ResourceType, Resource } from '../types/resource'
import { useSettingsStore } from '../stores/settings'

export function useResourceData() {
  const settingsStore = useSettingsStore()
  const tableData = ref<Resource[]>(settingsStore.tableData)
  const resType = ref<ResourceType[]>(["all"])
  const typeOptions = ref([
    { value: "all", label: "全部" },
    { value: "image", label: "图片" },
    { value: "audio", label: "音频" },
    { value: "video", label: "视频" },
    { value: "m3u8", label: "m3u8" },
    { value: "live", label: "直播流" },
    { value: "xls", label: "文档" },
    { value: "doc", label: "doc" },
    { value: "pdf", label: "pdf" }
  ])

  const handleSelectionChange = (val: Resource[]) => {
    // 处理选择变化
  }

  const handleClear = () => {
    tableData.value = []
    settingsStore.updateTableData([])
  }

  const handleDel = (index: number) => {
    tableData.value.splice(index, 1)
    settingsStore.updateTableData([...tableData.value])
  }

  watch(resType, () => {
    localStorage.setItem("res-type-arr", resType.value.join(","))
  }, { deep: true })

  return {
    tableData,
    resType,
    typeOptions,
    handleSelectionChange,
    handleClear,
    handleDel
  }
}
