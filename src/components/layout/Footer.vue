<script setup lang="ts">
import { ipcRenderer } from 'electron'
import pkg from '../../../package.json'

const version = pkg.version

</script>

<template>
  <footer class="footer">
    <div class="version-info">
      当前版本: {{ version }}
    </div>
  </footer>
</template>

<style lang="less" scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 10px 0;

  .version-info {
    font-size: 14px;
    color: #606266;
  }
}
</style>
