<template>
  <div>
    Nuxt module playground!
    {{ fileSize }}
  </div>
</template>

<script setup>
const { fileSize } = useFileSize(12545745452)
</script>
