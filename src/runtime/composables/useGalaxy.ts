import { useNuxtApp } from '#imports'

export const useGalaxy = () => {
  return useNuxtApp().$galaxy
}
