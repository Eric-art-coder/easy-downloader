import { defineStore } from 'pinia'
import { Resource } from '../types/resource'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    saveDir: localStorage.getItem('save_dir') || '',
    upstreamProxy: localStorage.getItem('upstream_proxy') || '',
    quality: localStorage.getItem('quality') || '-1',
    oldUpstreamProxy: localStorage.getItem('upstream_proxy') || '',
    tableData: JSON.parse(localStorage.getItem('res-table-data') || '[]') as Resource[],
  }),
  actions: {
    updateSettings(newSettings: Partial<typeof this.$state>) {
      Object.assign(this, newSettings)
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      localStorage.setItem('save_dir', this.saveDir)
      localStorage.setItem('upstream_proxy', this.upstreamProxy)
      localStorage.setItem('quality', this.quality)
    },
    updateTableData(newData: Resource[]) {
      this.tableData = newData
      localStorage.setItem('res-table-data', JSON.stringify(newData))
    },
  },
  getters: {
    isProxyChanged(): boolean {
      return this.oldUpstreamProxy !== this.upstreamProxy
    },
  },
})
