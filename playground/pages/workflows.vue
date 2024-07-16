<script setup lang="ts">
import { useNuxtApp, useFetch } from "#imports";

const { $galaxy } = useNuxtApp();

const { data } = await useFetch("/api/workflows", {
  method: "POST",
  body: { name: "test-totot" },
});
</script>

<template>
  <div>{{ data }}</div>
</template>
