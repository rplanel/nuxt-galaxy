<template>
  <div>
    Nuxt module playground!
    {{ fileSize }}
  </div>
  <NuxtPage />
</template>

<script setup>
const { fileSize } = useFileSize(12545745452)
</script>
