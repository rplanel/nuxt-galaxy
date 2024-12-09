import { defineNuxtRouteMiddleware, navigateTo } from '#app'
// import { useSupabaseUser } from '#supabase/server'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo(`/login?redirectTo=${to.path}`)
})
