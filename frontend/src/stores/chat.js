import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadMockRoutes, loadCrossCityMockRoutes, determineMockAlgorithm } from '@/api/mock'
import { simulateSSEStream } from '@/utils/sse'
import { EKD_TRIP_CITIES, CROSS_CITY_CITIES } from '@/utils/constants'
import { useAppStore } from './app'

export const useChatStore = defineStore('chat', () => {
  const dialogs = ref(JSON.parse(localStorage.getItem('chatDialogs') || '[]'))
  const currentDialogId = ref(null)
  const messages = ref([])
  const isStreaming = ref(false)
  const currentStreamController = ref(null)

  // Query quintuple being built through guided dialog
  const parsedFields = ref({
    departure_city: null,
    destination_city: null,
    start_time: null,
    end_time: null,
    num_stops: null,
  })

  const currentAlgorithm = ref(null)
  const currentIntentData = ref(null)
  const currentPois = ref([])

  function createDialog() {
    const id = Date.now()
    const dialog = { id, title: '新对话', messages: [], created_at: new Date().toISOString() }
    dialogs.value.unshift(dialog)
    currentDialogId.value = id
    messages.value = []
    resetState()
    saveDialogs()
    return dialog
  }

  function switchDialog(id) {
    const dialog = dialogs.value.find(d => d.id === id)
    if (dialog) {
      currentDialogId.value = id
      messages.value = [...dialog.messages]
      resetState()
    }
  }

  function resetState() {
    parsedFields.value = { departure_city: null, destination_city: null, start_time: null, end_time: null, num_stops: null }
    currentAlgorithm.value = null
    currentIntentData.value = null
    currentPois.value = []
    isStreaming.value = false
    if (currentStreamController.value) {
      currentStreamController.value.close()
      currentStreamController.value = null
    }
  }

  // Parse city from user text (simple keyword matching for mock mode)
  function parseUserInput(text) {
    const lower = text.toLowerCase()
    const allCities = [...EKD_TRIP_CITIES, ...CROSS_CITY_CITIES]
    for (const city of allCities) {
      if (lower.includes(city.toLowerCase())) {
        // Determine if it's destination or source hint
        if (lower.includes('从') || lower.includes('from') || lower.includes('住在') || lower.includes('live in')) {
          if (!parsedFields.value.departure_city) parsedFields.value.departure_city = city
        }
        if (lower.includes('去') || lower.includes('visit') || lower.includes('to') || lower.includes('玩') || lower.includes('trip in') || lower.includes('游')) {
          parsedFields.value.destination_city = city
        }
        if (!parsedFields.value.destination_city) parsedFields.value.destination_city = city
      }
    }
    // Also match non-dataset cities by name (for DeepSeek demo)
    const chineseCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆', '南京', '武汉', '厦门', '青岛', '大连', '苏州', '三亚']
    for (const city of chineseCities) {
      if (text.includes(city)) parsedFields.value.destination_city = city
    }

    // Parse time
    const timePatterns = [
      /(\d{1,2})\s*[点时:：]\s*(am|pm|上午|下午)?/gi,
      /(上午|下午|早上|晚上)\s*(\d{1,2})/gi,
      /(\d{1,2})\s*(am|pm)/gi,
    ]
    const times = []
    for (const pattern of timePatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        let hour = parseInt(match[1] || match[2])
        const period = (match[2] || match[1] || '').toLowerCase()
        if (period.includes('pm') || period.includes('下午') || period.includes('晚上')) {
          if (hour < 12) hour += 12
        }
        times.push(hour)
      }
    }
    if (times.length >= 2) {
      parsedFields.value.start_time = Math.min(...times)
      parsedFields.value.end_time = Math.max(...times)
    } else if (times.length === 1) {
      if (!parsedFields.value.start_time) parsedFields.value.start_time = times[0]
      else if (!parsedFields.value.end_time) parsedFields.value.end_time = times[0]
    }

    // Parse num_stops
    const stopsMatch = text.match(/(\d+)\s*(个|站|景点|stops?|places?|pois?)/i)
    if (stopsMatch) parsedFields.value.num_stops = parseInt(stopsMatch[1])
  }

  function getMissingFields() {
    const missing = []
    if (!parsedFields.value.destination_city) missing.push('destination_city')
    if (parsedFields.value.start_time === null) missing.push('start_time')
    if (parsedFields.value.end_time === null) missing.push('end_time')
    return missing
  }

  function generateGuideQuestion(missing) {
    if (missing.includes('destination_city')) return '请问您想去哪个城市旅行呢？'
    if (missing.includes('start_time') && missing.includes('end_time')) return '您计划什么时候出发，大概玩到几点呢？比如"上午9点到晚上6点"'
    if (missing.includes('start_time')) return '请问您计划几点出发呢？'
    if (missing.includes('end_time')) return '大概玩到几点结束呢？'
    return null
  }

  async function sendMessage(text) {
    if (isStreaming.value) return

    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    messages.value.push(userMsg)

    // Parse input
    parseUserInput(text)

    const missing = getMissingFields()

    if (missing.length > 0) {
      // Need more info — send guide question
      const question = generateGuideQuestion(missing)
      const dest = parsedFields.value.destination_city
      let response = ''
      if (dest && missing.length <= 2) {
        response = `好的！${dest}是个很棒的选择~ ${question}`
      } else {
        response = question
      }
      messages.value.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() })
      saveCurrentDialog()
      return
    }

    // Quintuple complete — determine algorithm and start streaming
    const dest = parsedFields.value.destination_city
    const source = parsedFields.value.departure_city
    const algorithm = determineMockAlgorithm(dest, source)
    currentAlgorithm.value = algorithm

    const appStore = useAppStore()
    appStore.setCurrentAlgorithm(algorithm)

    // Set defaults
    if (!parsedFields.value.num_stops) parsedFields.value.num_stops = 5
    if (!parsedFields.value.start_time) parsedFields.value.start_time = 9
    if (!parsedFields.value.end_time) parsedFields.value.end_time = 18

    // Start streaming
    isStreaming.value = true
    currentPois.value = []
    currentIntentData.value = null

    // Add assistant message placeholder for streaming
    const assistantMsg = { role: 'assistant', content: '', timestamp: new Date().toISOString(), pois: [], intentData: null }
    messages.value.push(assistantMsg)
    const msgIndex = messages.value.length - 1

    // Load mock route data
    let mockRoute = null
    if (algorithm === 'EKD-Trip') {
      const routes = await loadMockRoutes(dest)
      if (routes && routes.length > 0) mockRoute = routes[0] // Pick first route
    } else if (algorithm === 'CrossCityLLMCPR') {
      const routes = await loadCrossCityMockRoutes(source || 'New York', dest)
      if (routes && routes.length > 0) mockRoute = routes[0]
    }

    if (!mockRoute) {
      // DeepSeek or no mock data — generate simple mock response
      messages.value[msgIndex].content = `为您规划了${dest}旅行路线！\n\n由于${dest}不在算法数据集覆盖范围内，系统使用DeepSeek AI为您生成路线。\n\n（真实模式下将调用DeepSeek API生成完整路线）`
      isStreaming.value = false
      saveCurrentDialog()
      return
    }

    // Simulate SSE stream
    currentStreamController.value = simulateSSEStream(mockRoute, {
      thinking: (data) => {
        messages.value[msgIndex].content = '正在为您规划路线...\n\n'
      },
      route_text: (data) => {
        messages.value[msgIndex].content += data.delta
      },
      poi_added: (data) => {
        currentPois.value.push(data.poi)
        messages.value[msgIndex].pois = [...currentPois.value]
      },
      intent_data: (data) => {
        currentIntentData.value = data
        messages.value[msgIndex].intentData = data
      },
      done: (data) => {
        isStreaming.value = false
        currentStreamController.value = null
        saveCurrentDialog()
      },
      error: (data) => {
        isStreaming.value = false
        messages.value[msgIndex].content += '\n\n[Error occurred]'
        currentStreamController.value = null
      },
    })
  }

  function saveCurrentDialog() {
    const dialog = dialogs.value.find(d => d.id === currentDialogId.value)
    if (dialog) {
      dialog.messages = [...messages.value]
      // Auto-generate title from first user message
      const firstUserMsg = messages.value.find(m => m.role === 'user')
      if (firstUserMsg) dialog.title = firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '')
      dialog.updated_at = new Date().toISOString()
    }
    saveDialogs()
  }

  function saveDialogs() {
    localStorage.setItem('chatDialogs', JSON.stringify(dialogs.value))
  }

  function deleteDialog(id) {
    dialogs.value = dialogs.value.filter(d => d.id !== id)
    if (currentDialogId.value === id) {
      currentDialogId.value = null
      messages.value = []
    }
    saveDialogs()
  }

  return {
    dialogs, currentDialogId, messages, isStreaming, parsedFields,
    currentAlgorithm, currentIntentData, currentPois,
    createDialog, switchDialog, sendMessage, deleteDialog, resetState,
  }
})
