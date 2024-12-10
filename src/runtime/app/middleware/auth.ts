import { defineNuxtRouteMiddleware, navigateTo, useSupabaseUser } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo(`/login?redirectTo=${to.path}`)
})
