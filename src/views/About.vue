<script lang="ts" setup>
import { ipcRenderer } from 'electron'

const links = [
  { text: 'MAC 教学视频（暂无）', url: '' },
  { text: 'WINDOWS 教学视频（暂无）', url: '' },
  { text: 'M3U8在线下载', url: 'https://m3u8-down.gowas.cn/' },
  { text: '问题反馈（暂无）', url: '' }
]

const openLink = (url: string) => {
  ipcRenderer.invoke('invoke_open_default_browser', { url })
}

const instructions = `
使用方法:
1. 打开本软件
2. 软件首页选择要获取的资源类型（默认选中的视频）
3. 打开要捕获的源， 如：视频号、网页、小程序等等
4. 返回软件首页即可看到要下载的资源
5. 直播流复制的链接如何使用？可以使用obs或者ffmpeg命令

常见问题:
1. 无法拦截获取
   手动检测系统代理是否设置正确 本软件代理地址: 127.0.0.1:8899
2. 关闭软件后无法正常上网
   手动关闭系统代理设置
3. 视频号抓取流程
   将需要下载的视频发给好友或者文件助手 再打开该视频即可拦截到，通常软件界面对应视频会出现标题描述、对应操作会出现解密下载按钮
   大视频可以复制链接通过其他工具加速下载，然后再通过对应的视频操作项进行"视频解密"

实现原理（这个也是初衷）:
通过代理网络抓包拦截响应，筛选出有用的资源。
同fiddler、charles等抓包软件、浏览器F12打开控制也能达到目的，
只不过这些软件需要手动进行筛选，对于小白用户上手还是有点难度，本软件对部分资源做了特殊处理，
更适合大众用户，所以就有了本项目这样的软件。
`
</script>

<template>
  <div class="about">
    <h1>关于软件</h1>
    <el-card class="info-card">
      <p>本软件持续更新，只供自行研发兴趣探索，不收取费用。</p>
      <div class="button-container">
        <el-button v-for="link in links" :key="link.text" type="primary" @click="openLink(link.url)">
          {{ link.text }}
        </el-button>
      </div>
    </el-card>
    <el-card class="instructions-card">
      <div class="instructions-content">
        <h2>使用说明</h2>
        <div class="instructions-text">{{ instructions }}</div>
      </div>
    </el-card>
  </div>
</template>

<style lang="less" scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    color: #409EFF;
    text-align: center;
    margin-bottom: 20px;
  }

  .info-card {
    margin-bottom: 20px;

    p {
      margin-bottom: 10px;
    }

    .button-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .instructions-card {
    .instructions-content {
      h2 {
        text-align: center;
        color: #409EFF;
        margin-bottom: 15px;
      }

      .instructions-text {
        white-space: pre-wrap;
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        color: #333;
        text-align: left;
        line-height: 1.5;
      }
    }
  }
}
</style>
