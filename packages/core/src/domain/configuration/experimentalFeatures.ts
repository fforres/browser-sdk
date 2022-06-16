/**
 * LIMITATION:
 * For NPM setup, this feature flag singleton is shared between RUM and Logs product.
 * This means that an experimental flag set on the RUM product will be set on the Logs product.
 * So keep in mind that in certain configurations, your experimental feature flag may affect other products.
 */

import { performDraw } from '../../tools/utils'

let enabledExperimentalFeatures: Set<string>

export function updateExperimentalFeatures(
  enabledFeatures: Array<string | { [name: string]: number }> | undefined
): void {
  // Safely handle external data
  if (!Array.isArray(enabledFeatures)) {
    return
  }

  if (!enabledExperimentalFeatures) {
    enabledExperimentalFeatures = new Set()
  }

  for (const feature of enabledFeatures) {
    const featureName = typeof feature === 'object' ? Object.keys(feature)[0] : feature
    const sampleRate = typeof feature === 'object' ? feature[featureName] : undefined

    if (sampleRate === undefined || performDraw(sampleRate)) {
      enabledExperimentalFeatures.add(featureName)
    }
  }
}

export function isExperimentalFeatureEnabled(featureName: string): boolean {
  return !!enabledExperimentalFeatures && enabledExperimentalFeatures.has(featureName)
}

export function resetExperimentalFeatures(): void {
  enabledExperimentalFeatures = new Set()
}
