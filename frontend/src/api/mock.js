import axios from 'axios'

/**
 * Load mock route data for a given city from /mock/<city>.json
 */
export async function loadMockRoutes(city) {
  const response = await axios.get(`/mock/${city}.json`)
  return response.data
}

/**
 * Select a specific mock route by city and index
 */
export async function selectMockRoute(city, index) {
  const routes = await loadMockRoutes(city)
  if (routes && Array.isArray(routes) && routes[index]) {
    return routes[index]
  }
  return null
}

/**
 * Determine which mock algorithm to use based on destination and source cities
 */
export async function determineMockAlgorithm(dest, source) {
  try {
    const response = await axios.get('/mock/algorithm_map.json')
    const map = response.data
    const key = `${source}_${dest}`
    return map[key] || 'ekd_trip'
  } catch {
    return 'ekd_trip'
  }
}
