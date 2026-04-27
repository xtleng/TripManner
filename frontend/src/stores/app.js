import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const useMockData = ref(true)
  const currentAlgorithm = ref('')
  const supportedCities = ref([])

  // Actions
  function setUseMockData(value) {
    useMockData.value = value
  }

  function setCurrentAlgorithm(algo) {
    currentAlgorithm.value = algo
  }

  function setSupportedCities(cities) {
    supportedCities.value = cities
  }

  return {
    useMockData,
    currentAlgorithm,
    supportedCities,
    setUseMockData,
    setCurrentAlgorithm,
    setSupportedCities,
  }
})
