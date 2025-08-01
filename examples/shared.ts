import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Chart } from '@/chart'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Shared constants for examples
 *
 * Common configuration values used across example files
 * for consistent chart styling and export settings.
 */
export const EXAMPLE_CONFIG = {
  // Chart colors - vibrant dim blue theme
  BEAR_COLOR: [70, 130, 180] as [number, number, number],
  BULL_COLOR: [135, 206, 250] as [number, number, number],

  // Volume settings
  VOLUME_ENABLED: true,
  VOLUME_HEIGHT: 8,

  // Chart dimensions - using automatic scaling
  DEFAULT_WIDTH: 0,
  DEFAULT_HEIGHT: 0,

  // Export settings
  MAX_CANDLES: 200,
  DEFAULT_SCALE: 2,
  DEFAULT_BACKGROUND: 'dark' as const,

  // File paths
  OUTPUT_DIR: resolve(__dirname, 'output'),
  TEXT_FILE: 'example.txt',
  IMAGE_FILE: 'example.png'
}

/**
 * Common chart setup function
 *
 * Creates a chart with standard configuration for examples.
 *
 * @param candles - OHLCV data
 * @param title - Chart title
 * @returns Configured chart instance
 */
export function createExampleChart(candles: any[], title: string = 'BTC/USDT 4h Live Chart') {
  // Use dynamic dimensions like CLI for better clarity
  const width = candles.length * 2
  const height = Math.max(20, Math.floor(candles.length / 4))

  const chart = new Chart(candles, {
    title,
    width,
    height
  })

  // Apply standard styling
  chart.setBearColor(...EXAMPLE_CONFIG.BEAR_COLOR)
  chart.setBullColor(...EXAMPLE_CONFIG.BULL_COLOR)
  chart.setVolumePaneEnabled(EXAMPLE_CONFIG.VOLUME_ENABLED)
  chart.setVolumePaneHeight(EXAMPLE_CONFIG.VOLUME_HEIGHT)
  chart.setVolBearColor(...EXAMPLE_CONFIG.BEAR_COLOR)
  chart.setVolBullColor(...EXAMPLE_CONFIG.BULL_COLOR)

  // Enable smart scaling like CLI
  chart.setScalingMode('fit')
  chart.fitToData()

  return chart
}

/**
 * Get output file paths
 *
 * Returns resolved paths for text and image exports.
 *
 * @returns Object with text and image file paths
 */
export function getOutputPaths() {
  return {
    text: resolve(EXAMPLE_CONFIG.OUTPUT_DIR, EXAMPLE_CONFIG.TEXT_FILE),
    image: resolve(EXAMPLE_CONFIG.OUTPUT_DIR, EXAMPLE_CONFIG.IMAGE_FILE)
  }
}
