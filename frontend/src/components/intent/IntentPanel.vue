<script setup>
import { computed } from 'vue'
import { ALGORITHM_TYPES } from '@/utils/constants'
import TravelModeViz from './TravelModeViz.vue'
import DistanceCurve from './DistanceCurve.vue'
import PreferenceRadar from './PreferenceRadar.vue'
import TransferFlow from './TransferFlow.vue'
import CityPreference from './CityPreference.vue'

const props = defineProps({
  algorithmType: {
    type: String,
    default: '',
  },
  intentData: {
    type: Object,
    default: null,
  },
  sourceCity: {
    type: String,
    default: '',
  },
  targetCity: {
    type: String,
    default: '',
  },
})

const isEKDTrip = computed(
  () =>
    props.algorithmType === ALGORITHM_TYPES.EKD_TRIP &&
    props.intentData &&
    props.intentData.travel_mode
)

const isCrossCity = computed(
  () =>
    props.algorithmType === ALGORITHM_TYPES.CROSS_CITY &&
    props.intentData &&
    props.intentData.preference_factors
)

const showPanel = computed(() => isEKDTrip.value || isCrossCity.value)

const panelTitle = computed(() => {
  if (isEKDTrip.value) return '用户出行意图分析'
  if (isCrossCity.value) return '跨城市偏好意图分析'
  return ''
})

// CrossCity: extract preference labels in order
const preferenceLabels = computed(() => {
  if (!isCrossCity.value || !props.intentData.preference_factors) return []
  const factors = props.intentData.preference_factors
  return Object.keys(factors)
    .sort()
    .map((k) => factors[k].label)
})
</script>

<template>
  <Transition name="intent-fade">
    <div v-if="showPanel" class="intent-panel">
      <div class="panel-header">
        <div class="panel-title">{{ panelTitle }}</div>
      </div>

      <!-- EKD-Trip: TravelMode + DistanceCurve -->
      <div v-if="isEKDTrip" class="panel-body ekd-layout">
        <div class="viz-block mode-block">
          <TravelModeViz
            :mode="intentData.travel_mode"
            :confidence="intentData.travel_mode_confidence || 0"
          />
        </div>
        <div class="viz-block curve-block">
          <DistanceCurve
            :distance-data="intentData.distance_to_destination_curve || []"
            :travel-mode="intentData.travel_mode"
          />
        </div>
      </div>

      <!-- CrossCity: Radar + TransferFlow + CityPreference -->
      <div v-if="isCrossCity" class="panel-body cross-city-layout">
        <div class="viz-block">
          <PreferenceRadar
            :preference-factors="intentData.preference_factors"
            :city-group-preference="intentData.city_group_preference || {}"
          />
        </div>
        <div class="viz-block">
          <TransferFlow
            :source-city="sourceCity"
            :target-city="targetCity"
            :transfer-weights="intentData.transfer_weights || {}"
            :preference-labels="preferenceLabels"
          />
        </div>
        <div class="viz-block">
          <CityPreference
            :city-group-preference="intentData.city_group_preference || {}"
            :reliability-score="intentData.reliability_score || 0"
            :blend-weight-eta="intentData.blend_weight_eta || 0.5"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.intent-panel {
  height: var(--intent-panel-height, 280px);
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 10px 12px;
  gap: 12px;
}

.viz-block {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

/* EKD layout: mode panel is narrower */
.ekd-layout .mode-block {
  flex: 0 0 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ekd-layout .curve-block {
  flex: 1;
}

/* CrossCity layout: equal thirds */
.cross-city-layout .viz-block {
  flex: 1;
}

/* Fade-in transition */
.intent-fade-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.intent-fade-leave-active {
  transition: opacity 0.25s ease;
}

.intent-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.intent-fade-leave-to {
  opacity: 0;
}
</style>
