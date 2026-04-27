import request from '@/utils/request'

export async function login(data) {
  try {
    const res = await request.post('/auth/login', data)
    return res
  } catch {
    // Mock mode fallback
    return {
      access_token: 'mock-token-' + Date.now(),
      user: { id: 1, username: data.username, nickname: data.username, avatar_url: '', preferences: {} }
    }
  }
}

export async function register(data) {
  try {
    const res = await request.post('/auth/register', data)
    return res
  } catch {
    return {
      access_token: 'mock-token-' + Date.now(),
      user: { id: 1, username: data.username, nickname: data.username, avatar_url: '', preferences: {} }
    }
  }
}

export async function getProfile() {
  try {
    return await request.get('/user/profile')
  } catch {
    const saved = JSON.parse(localStorage.getItem('userInfo') || 'null')
    return saved || { id: 1, username: 'demo', nickname: 'Demo User', avatar_url: '', preferences: {} }
  }
}

export async function updateProfile(data) {
  try { return await request.put('/user/profile', data) } catch { return data }
}

export async function updatePreferences(data) {
  try { return await request.put('/user/preferences', data) } catch { return data }
}
