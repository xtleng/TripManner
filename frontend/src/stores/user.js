import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getProfile, updatePreferences as apiUpdatePreferences } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  async function login(credentials) {
    const res = await apiLogin(credentials)
    token.value = res.token || res.access_token || ''
    localStorage.setItem('token', token.value)
    await fetchProfile()
    return res
  }

  async function register(data) {
    const res = await apiRegister(data)
    token.value = res.token || res.access_token || ''
    localStorage.setItem('token', token.value)
    await fetchProfile()
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  async function fetchProfile() {
    try {
      const res = await getProfile()
      userInfo.value = res
      localStorage.setItem('userInfo', JSON.stringify(res))
    } catch {
      // Profile fetch failed, keep existing info
    }
  }

  async function updatePreferences(prefs) {
    const res = await apiUpdatePreferences(prefs)
    if (userInfo.value) {
      userInfo.value.preferences = prefs
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
    return res
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    fetchProfile,
    updatePreferences,
  }
})
