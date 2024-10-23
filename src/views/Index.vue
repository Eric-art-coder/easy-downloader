<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from "vue"
import {ipcRenderer} from 'electron'
import {ElMessage, ElLoading, ElTable} from "element-plus"
import localStorageCache from "../common/localStorage"
import {Delete, Promotion, Box} from "@element-plus/icons-vue"

interface resData {
  url: string,
  url_sign: string,
  size: any,
  platform: string,
  type: string,
  type_str: string,
  progress_bar: any,
  save_path: string,
  decode_key: string,
  description: string,
}

const tableData = ref<resData[]>([])


const isInitApp = ref(false)

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<resData[]>([])
const loading = ref()
const resType = ref(["all"])
const typeOptions = ref([
  {
    value: "all",
    label: "全部",
  },
  {
    value: "image",
    label: "图片",
  }, {
    value: "audio",
    label: "音频"
  }, {
    value: "video",
    label: "视频"
  }, {
    value: "m3u8",
    label: "m3u8"
  }, {
    value: "live",
    label: "直播流"
  }, {
    value: "xls",
    label: "文档"
  }, {
    value: "doc",
    label: "doc"
  }, {
    value: "pdf",
    label: "pdf"
  }
])

const tableHeight = ref(400)

// 添加一个加载状态
const isLoading = ref(false)

onMounted(() => {
  let resTypeCache = localStorageCache.get("res-type-arr")
  if (resTypeCache) {
    resType.value = resTypeCache.split(",")
  }

  let tableDataCache = localStorageCache.get("res-table-data")
  if (tableDataCache) {
    tableData.value = tableDataCache
  }

  ipcRenderer.on('on_get_queue', (res, data) => {
    // @ts-ignore
    if (resType.value.includes("all") || resType.value.includes(data.type_str)) {
      tableData.value.push(data)
      localStorageCache.set("res-table-data", tableData.value, -1)
    }
  })

  ipcRenderer.on('on_down_file_schedule', (res: any, data: any) => {
    loading.value && loading.value.setText(`${data.schedule}%`)
  })

  ipcRenderer.invoke('invoke_app_is_init').then((isInit: boolean) => {
    if (!isInit && !isInitApp.value) {
      isInitApp.value = true
      ipcRenderer.invoke('invoke_init_app')
    }
  })

  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  ipcRenderer.invoke('invoke_start_proxy', {upstream_proxy: localStorageCache.get("upstream_proxy")}).then(() => {
    loading.value.close()
  }).catch((err) => {
    ElMessage({
      message: err,
      type: 'warning',
    })
    loading.value.close()
  })
  window.addEventListener("resize", handleResize);
  handleResize()
})

onUnmounted(() => {
  ipcRenderer.removeListener('on_get_queue', (res) => {
    // console.log(res)
  })

  ipcRenderer.removeListener('on_down_file_schedule', (res) => {
    // console.log(res)
  })
})

watch(resType, (res, res1) => {
  localStorageCache.set("res-type-arr", resType.value.join(","), -1)
}, {deep: true})

const handleResize = () => {
  const height = document.documentElement.clientHeight || window.innerHeight;
  tableHeight.value = height - 115
}

const handleSelectionChange = (val: resData[]) => {
  multipleSelection.value = val
}

const handleBatchDown = async () => {
  if (multipleSelection.value.length <= 0) {
    return
  }

  let save_dir = localStorageCache.get("save_dir")

  if (!save_dir) {
    ElMessage({
      message: '请设置保存目录',
      type: 'warning'
    })
    return
  }

  loading.value = ElLoading.service({
    lock: true,
    text: '下载中',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  const quality = localStorageCache.get("quality") ? localStorageCache.get("quality") : -1
  for (const item of multipleSelection.value) {
    let downRes = await ipcRenderer.invoke('invoke_down_file', {
      data: Object.assign({}, item),
      save_path: save_dir,
      quality: quality,
    })

    if (downRes !== false) {
      item.progress_bar = "100%"
      item.save_path = downRes.fullFileName
    }
  }
  loading.value.close()
  multipleTableRef.value!.clearSelection()
}


const handleDown = async (index: number, row: any) => {
  const save_dir = localStorageCache.get("save_dir")
  if (!save_dir) {
    ElMessage({
      message: '请设置保存目录',
      type: 'warning'
    })
    return
  }

  loading.value = ElLoading.service({
    lock: true,
    text: '下载中',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  const quality = localStorageCache.get("quality") ? localStorageCache.get("quality") : -1
  ipcRenderer.invoke('invoke_down_file', {
    data: Object.assign({}, tableData.value[index]),
    save_path: save_dir,
    quality: quality,
  }).then((res) => {
    if (res !== false) {
      tableData.value[index].progress_bar = "100%"
      tableData.value[index].save_path = res.fullFileName
      localStorageCache.set("res-table-data", tableData.value, -1)
    } else {
      ElMessage({
        message: "下载失败",
        type: 'warning',
      })
    }
    loading.value.close()
  }).catch((err) => {
    ElMessage({
      message: "下载失败",
      type: 'warning',
    })
    loading.value.close()
  })
}

const decodeWxFile = (index: number) => {
  loading.value = ElLoading.service({
    lock: true,
    text: "解密中",
    background: 'rgba(0, 0, 0, 0.7)',
  })

  ipcRenderer.invoke('invoke_select_wx_file', {
    index: index,
    data: Object.assign({}, tableData.value[index]),
  }).then((res) => {
    if (res !== false) {
      ElMessage({
        message: "解密成功: " + res.fullFileName,
        type: 'success',
      })
      tableData.value[index].progress_bar = "100%"
      tableData.value[index].save_path = res.fullFileName
      localStorageCache.set("res-table-data", tableData.value, -1)
    } else {
      ElMessage({
        message: "解密失败",
        type: 'warning',
      })
    }
    loading.value.close()
  }).catch((err) => {
    ElMessage({
      message: "解密失败",
      type: 'warning',
    })
    loading.value.close()
  })
}

const handlePreview = (index: number, row: any) => {
  ipcRenderer.invoke('invoke_resources_preview', {url: row.url}).catch(() => {
  })
}

const handleClear = () => {
  tableData.value = []
  localStorageCache.del("res-table-data")
  ipcRenderer.invoke('invoke_file_del', {
    url_sign: "all"
  })
}

const handleCopy = (text: string) => {
  let el = document.createElement('input')
  el.setAttribute('value', text)
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  ElMessage({
    message: "复制成功",
    type: 'success',
  })
}

const handleDel = (index: number) => {
  let arr = tableData.value
  arr.splice(index, 1);
  tableData.value = arr
  localStorageCache.set("res-table-data", tableData.value, -1)
  ipcRenderer.invoke('invoke_file_del', {
    url_sign: tableData.value[index].url_sign
  })
}

const openFileDir = (index: number) => {
  ipcRenderer.invoke('invoke_open_file_dir', {
    save_path: tableData.value[index].save_path
  })
}

const handleInitApp = () => {
  isLoading.value = true
  ipcRenderer.invoke('invoke_app_is_init').then((isInit: boolean) => {
    if (isInit) {
      isInitApp.value = false
    } else {
      ipcRenderer.invoke('invoke_init_app')
    }
  }).finally(() => {
    isLoading.value = false
  })
}

</script>

<template>
  <el-container class="container">
    <el-header class="header">
      <el-button type="primary" @click="handleBatchDown">批量下载</el-button>
      <el-button v-if="isInitApp" @click="handleInitApp">
        <el-icon><Promotion /></el-icon>
        <span>安装检测</span>
      </el-button>
      <el-button @click="handleClear">
        <el-icon><Delete /></el-icon>
        <span>清空列表</span>
      </el-button>
      <el-select
        v-model="resType"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="2"
        placeholder="资源类型"
        style="width: auto;min-width:120px"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-header>
    <el-table
      ref="multipleTableRef"
      @selection-change="handleSelectionChange"
      :data="tableData"
      :height="tableHeight"
      max-height="100%"
      stripe
      v-loading="isLoading"
      element-loading-text="加载中..."
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="预览" show-overflow-tooltip width="150">
        <template #default="scope">
          <div class="show_res">
            <video v-if="scope.row.type_str === 'video'" class="video" :src="scope.row.url" controls preload="none" />
            <img v-if="scope.row.type_str === 'image'" class="img" :src="scope.row.url" crossorigin="anonymous" />
            <audio v-if="scope.row.type_str === 'audio'" class="audio" controls preload="none">
              <source :src="scope.row.url" :type="scope.row.type" />
            </audio>
            <div v-if="scope.row.type_str !== 'video' && scope.row.type_str !== 'image' && scope.row.type_str !== 'audio'">
              {{scope.row.type_str}}类型无法预览
            </div>
            <div>{{scope.row.description}}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="type_str" label="类型" width="100" />
      <el-table-column prop="platform" label="主机地址" />
      <el-table-column prop="size" label="资源大小" width="100" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <div class="actions">
            <template v-if="scope.row.type_str !== 'm3u8' && scope.row.type_str !== 'live'">
              <el-button link type="primary" @click="handleDown(scope.$index, scope.row)">
                {{scope.row.decode_key || scope.row.decryptor_array ? "解密下载" : "下载"}}
              </el-button>
              <el-button v-if="scope.row.decode_key || scope.row.decryptor_array" link type="primary" @click="decodeWxFile(scope.$index)">
                视频解密
              </el-button>
              <el-button link type="primary" @click="handlePreview(scope.$index, scope.row)">预览</el-button>
            </template>
            <el-button link type="primary" @click="handleCopy(scope.row.url)">复制链接</el-button>
            <el-button link type="primary" @click="handleDel(scope.$index)">删除</el-button>
            <el-button v-if="scope.row.save_path" link type="primary" @click="openFileDir(scope.$index)">打开目录</el-button>
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" :image-size="100">
          <template #image>
            <el-icon :size="60" color="#909399"><Inbox /></el-icon>
          </template>
          <el-button type="primary" @click="handleInitApp">开始检测资源</el-button>
        </el-empty>
      </template>
    </el-table>
  </el-container>
</template>

<style scoped lang="less">
.container {
  padding: 0.5rem;

  .header {
    display: flex;
    align-items: center;
    padding: 0;
    margin-bottom: 0.5rem;

    .el-button {
      margin-right: 0.5rem;
      padding: 6px 12px;
      font-size: 0.9em;

      .el-icon {
        margin-right: 4px;
      }

      span {
        vertical-align: middle;
      }
    }

    .el-select {
      margin-left: auto;
    }
  }

  .el-table {
    margin-top: 0.5rem;
  }

  .el-button {
    margin-right: 0.3rem;
    padding: 8px 15px;

    &:last-child {
      margin-right: 0;
    }

    p {
      margin-left: 0.2rem;
    }
  }

  .show_res {
    .img, .video {
      max-height: 120px;
      width: auto;
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;

    .el-button {
      padding: 4px 8px;
      font-size: 0.85em;
    }
  }

  // 全局样式调整
  :deep(.el-table) {
    font-size: 0.9em;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .el-table__header-wrapper {
      th {
        background-color: #f5f7fa;
        color: #606266;
        font-weight: 600;
        padding: 8px 0;
      }
    }

    .el-table__body-wrapper {
      td {
        padding: 8px 0;
      }
    }

    .el-table__row {
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .el-table__empty-block {
      min-height: 60px;
    }
  }

  .show_res {
    .img, .video {
      max-height: 120px;
      width: auto;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;

    .el-button {
      padding: 4px 8px;
      font-size: 0.85em;
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }

  :deep(.el-select) {
    .el-input__wrapper {
      padding: 0 8px;
    }

    .el-input__inner {
      font-size: 0.9em;
    }
  }

  :deep(.el-empty) {
    padding: 40px 0;

    .el-empty__image {
      width: 100px;
      height: 100px;
    }

    .el-empty__description {
      margin-top: 20px;
      color: #909399;
    }

    .el-button {
      margin-top: 20px;
    }
  }
}
</style>

