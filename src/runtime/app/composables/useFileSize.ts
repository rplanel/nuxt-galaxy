import { computed, toValue } from 'vue'
import type { MaybeRef } from 'vue'

export const useFileSize = (bytesRef: MaybeRef<number | undefined>) => {
  const fileSize = computed(() => {
    let bytes = toValue(bytesRef)
    if (bytes) {
      const thresh = 1024
      if (Math.abs(bytes) < thresh) {
        return bytes + ' B'
      }
      const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let u = -1
      do {
        bytes /= thresh
        ++u
      } while (Math.abs(bytes) >= thresh && u < units.length - 1)
      return `${bytes.toFixed(1)} ${units[u]}`
    }
    if (bytes === 0) return `${bytes} B`
  })
  return { fileSize }
}
