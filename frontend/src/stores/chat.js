import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  // State
  const dialogs = ref([])
  const currentDialogId = ref(null)
  const messages = ref([])
  const isStreaming = ref(false)
  const parsedFields = ref({
    destination: '',
    source: '',
    travelMode: '',
    preference: '',
    constraints: '',
  })

  // Actions
  function setDialogs(list) {
    dialogs.value = list
  }

  function setCurrentDialogId(id) {
    currentDialogId.value = id
  }

  function addMessage(message) {
    messages.value.push(message)
  }

  function setMessages(list) {
    messages.value = list
  }

  function setIsStreaming(value) {
    isStreaming.value = value
  }

  function updateParsedField(field, value) {
    if (field in parsedFields.value) {
      parsedFields.value[field] = value
    }
  }

  function resetParsedFields() {
    parsedFields.value = {
      destination: '',
      source: '',
      travelMode: '',
      preference: '',
      constraints: '',
    }
  }

  return {
    dialogs,
    currentDialogId,
    messages,
    isStreaming,
    parsedFields,
    setDialogs,
    setCurrentDialogId,
    addMessage,
    setMessages,
    setIsStreaming,
    updateParsedField,
    resetParsedFields,
  }
})
