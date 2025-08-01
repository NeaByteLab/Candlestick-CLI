/**
 * Chart rendering components and classes
 *
 * Provides all chart-related components for creating, managing, and rendering
 * ASCII art candlestick charts. Includes data management, rendering engine,
 * axis handling, volume visualization, and information display components.
 *
 * @example
 * ```typescript
 * import { Chart, ChartData, ChartRenderer } from '@/chart'
 *
 * const chartData = new ChartData(candles)
 * const renderer = new ChartRenderer()
 * const chart = new Chart(candles, { title: 'BTC/USDT' })
 * ```
 */

// Chart components
export { Chart } from '@/chart/chart'
export { ChartData } from '@/chart/chart-data'
export { ChartRenderer } from '@/chart/chart-renderer'
export { CandleSet } from '@/chart/candle-set'
export { YAxis } from '@/chart/y-axis'
export { VolumePane } from '@/chart/volume-pane'
export { InfoBar } from '@/chart/info-bar'
