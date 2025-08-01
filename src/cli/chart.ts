import { Chart } from '@/chart/chart'
import type { CliOptions } from './types'
import type { Candles } from '@/types/candlestick'
import { validateColor } from './validation'

/**
 * Configure chart with CLI options
 *
 * Creates and configures a Chart instance based on CLI options.
 * Applies colors, volume settings, and other customizations.
 * Uses dynamic dimensions for exports based on data length.
 * Enables auto-resize for terminal display when dimensions are 0.
 *
 * @param options - CLI options for chart configuration
 * @param candles - Candle data for the chart
 * @returns Configured Chart instance
 *
 * @example
 * ```typescript
 * const options = {
 *   title: 'BTC/USDT',
 *   bearColor: '#ff6b6b',
 *   bullColor: '#51cf66',
 *   volume: true,
 *   volumeHeight: 5
 * }
 * const chart = configureChart(options, candles)
 * ```
 */
export function configureChart(options: CliOptions, candles: Candles): Chart {
  const isExport = !!options.output
  let width = options.width || 0
  let height = options.height || 0
  if (!isExport && (width === 0 || height === 0)) {
    const terminalSize = { width: 0, height: 0 }
    if (typeof globalThis.process !== 'undefined' && globalThis.process.stdout) {
      const { columns, rows } = globalThis.process.stdout
      if (columns && rows && columns > 0 && rows > 0) {
        terminalSize.width = columns
        terminalSize.height = rows
      }
    }
    width = width || terminalSize.width || 120
    height = height || terminalSize.height || 30
  } else if (isExport) {
    width = candles.length * 2
    height = Math.max(20, Math.floor(candles.length / 4))
  }
  const chartOptions: {
    title: string
    width: number
    height: number
  } = {
    title: options.title || 'Candlestick Chart',
    width,
    height
  }
  const chart = new Chart(candles, chartOptions)
  chart.setScalingMode('fit')
  if (!isExport) {
    chart.fitToData()
  }
  configureChartColors(chart, options)
  configureChartVolume(chart, options)
  return chart
}

/**
 * Configure chart colors from CLI options
 *
 * Applies bear and bull colors to the chart with validation.
 * Configures volume colors to match the main candle colors.
 * Throws errors for invalid color formats.
 *
 * @param chart - Chart instance to configure
 * @param options - CLI options containing color settings
 * @throws Error if color format is invalid
 *
 * @example
 * ```typescript
 * configureChartColors(chart, { bearColor: '#ff6b6b', bullColor: '#51cf66' })
 * ```
 */
function configureChartColors(chart: Chart, options: CliOptions): void {
  if (options.bearColor) {
    const bearColor = validateColor(options.bearColor, 'bear')
    chart.setBearColor(...bearColor)
    const volBearColor = bearColor.map(c => Math.min(255, Math.floor(c * 1.3))) as [number, number, number]
    chart.setVolBearColor(...volBearColor)
  }
  if (options.bullColor) {
    const bullColor = validateColor(options.bullColor, 'bull')
    chart.setBullColor(...bullColor)
    const volBullColor = bullColor.map(c => Math.min(255, Math.floor(c * 1.3))) as [number, number, number]
    chart.setVolBullColor(...volBullColor)
  }
}

/**
 * Configure chart volume settings from CLI options
 *
 * Sets volume pane enabled/disabled and height based on CLI options.
 * Handles volume pane configuration with validation.
 *
 * @param chart - Chart instance to configure
 * @param options - CLI options containing volume settings
 *
 * @example
 * ```typescript
 * configureChartVolume(chart, { volume: true, volumeHeight: 5 })
 * ```
 */
function configureChartVolume(chart: Chart, options: CliOptions): void {
  if (options.volume) {
    chart.setVolumePaneEnabled(true)
    chart.setVolumePaneHeight(options.volumeHeight || 5)
  } else {
    chart.setVolumePaneEnabled(false)
  }
}
