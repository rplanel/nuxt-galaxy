<template>
  <div>
    Nuxt module playground!
    <div>
      {{ fileSize }}
    </div>
    <div>
      {{ roleType }}
    </div>
    <div>{{ rolePermissions }}</div>
  </div>
</template>

<script setup lang="ts">
// import type { RolePermission, RoleType } from '
import type { RolePermission, RoleType } from '#build/types/nuxt-galaxy'
import { useFileSize } from '#imports'

const { fileSize } = useFileSize(12545745452)
const roleType: RoleType = 'user'
const rolePermissions: RolePermission = 'instances.delete'
</script>
