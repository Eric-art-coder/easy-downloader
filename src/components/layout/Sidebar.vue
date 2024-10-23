<script setup lang="ts">
import { inject, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VideoCamera, Share, Setting } from '@element-plus/icons-vue'
import localStorageCache from "../../common/localStorage"

const APP_NAME = "EASY DOWNLOADER"
const sidebarCollapse = inject('sidebarCollapse', ref(false))
const router = useRouter()

const activeRoute = ref(localStorageCache.get('last-route') || "/index")

const menuItems = [
  { key: "1", index: "/index", icon: VideoCamera, label: "嗅探" },
  { key: "2", index: "/about", icon: Share, label: "帮助" },
  { key: "99", index: "/setting", icon: Setting, label: "设置" }
]

const logoVisible = computed(() => !sidebarCollapse.value)

onMounted(() => {
  router.afterEach((to) => {
    activeRoute.value = to.path
    localStorageCache.set('last-route', to.path)
  })
})
</script>

<template>
  <div class="sidebar">
    <el-menu
      class="menu"
      :collapse="sidebarCollapse"
      :default-active="activeRoute"
      router
    >
      <div class="logo">
        <img src="../../assets/logo.png" alt="Logo" />
        <span v-if="logoVisible">{{ APP_NAME }}</span>
      </div>
      <el-menu-item
        v-for="item in menuItems"
        :key="item.key"
        :index="item.index"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="less" scoped>
.sidebar {
  height: 100vh;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.1);

  .menu {
    border-right: none;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;

    &:not(.el-menu--collapse) {
      width: 12rem;
    }

    .logo {
      margin: 1.5rem 0;
      display: flex;
      flex-direction: column; // 改为纵向排列
      align-items: center;
      justify-content: center;
      padding: 0 1rem;
      overflow: hidden;
      
      img {
        width: 3rem; // 稍微增大logo尺寸
        height: 3rem;
        transition: all 0.3s;
        object-fit: contain;
        margin-bottom: 0.5rem; // 添加底部间距
      }

      span {
        color: #1E90FF;
        font-size: 1rem; // 稍微减小字体大小
        font-weight: bold;
        white-space: nowrap;
        transition: all 0.3s;
        text-align: center; // 文字居中
      }
    }
  }

  // 添加悬停效果
  .el-menu-item {
    &:hover {
      background-color: rgba(30, 144, 255, 0.1) !important;
    }
  }

  // 激活项样式
  .el-menu-item.is-active {
    background-color: rgba(30, 144, 255, 0.2) !important;
    color: #1E90FF !important;
  }
}

// 适配折叠状态下的logo
.el-menu--collapse {
  .logo {
    img {
      width: 2.5rem;
      height: 2.5rem;
      margin-bottom: 0; // 移除底部间距
    }

    span {
      display: none;
    }
  }
}
</style>
