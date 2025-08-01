import type { Candles, ChartHighlights, RGBColor, CandleSetStats } from '@/types/candlestick'
import { CandleType } from '@/types/candlestick'
import type { Candle } from '@/types/candlestick'
import type { CandleSet } from '@/chart/candle-set'
import type { YAxis } from '@/chart/y-axis'
import { Chart } from '@/chart/chart'
import { CONSTANTS } from '@/constants'
import { truecolor } from '@/utils/core'

/**
 * ChartRenderer handles the rendering of candlestick charts
 *
 * Provides comprehensive chart rendering functionality including:
 * - Dynamic terminal size detection
 * - Auto-sizing based on data density
 * - Unicode candle rendering
 * - Color support for bullish/bearish candles
 * - Volume pane rendering
 * - Y-axis graduations
 *
 * @example
 * ```typescript
 * import { ChartRenderer } from '@/chart/chart-renderer'
 *
 * const renderer = new ChartRenderer()
 * const chartString = renderer.render(chart)
 * console.log(chartString)
 * ```
 */
export class ChartRenderer {
  /** Color for bearish candles (red) */
  bearishColor: RGBColor = [234, 74, 90]
  /** Color for bullish candles (green) */
  bullishColor: RGBColor = [52, 208, 88]

  /**
   * Apply color to candle based on type
   *
   * Applies the appropriate color (bullish or bearish) to a candle character
   * based on whether the candle represents an upward or downward price movement.
   * Uses truecolor ANSI escape sequences for precise color control.
   *
   * @param candleType - Type of candle (bullish or bearish)
   * @param string - String to colorize
   * @returns ANSI-colored string with truecolor formatting
   *
   * @example
   * ```typescript
   * const coloredBody = this.colorize(CandleType.Bullish, '┃')
   * // Returns green colored '┃' character
   * ```
   */
  private colorize(candleType: CandleType, string: string): string {
    const color = candleType === CandleType.Bearish ? this.bearishColor : this.bullishColor
    return truecolor(string, ...color)
  }

  /**
   * Get terminal dimensions
   *
   * Simple terminal size detection using process.stdout.
   *
   * @returns Terminal dimensions { width, height }
   *
   * @example
   * ```typescript
   * const { width, height } = this.getTerminalDimensions()
   * // Returns { width: 120, height: 30 }
   * ```
   */
  private getTerminalDimensions(): { width: number; height: number } {
    if (typeof globalThis.process !== 'undefined' && globalThis.process.stdout) {
      const { columns, rows } = globalThis.process.stdout
      if (columns && rows && columns > 0 && rows > 0) {
        return { width: columns, height: rows }
      }
    }
    return { width: 120, height: 30 }
  }

  /**
   * Render chart content with given candles
   *
   * Separates chart content rendering from terminal size calculations.
   * Uses CONSTANTS for consistent rendering.
   *
   * @param chart - Chart instance
   * @param candles - Candles to render
   * @returns Rendered chart string
   *
   * @example
   * ```typescript
   * const chartString = this.renderChartContent(chart, candles)
   * // Renders chart with specific candles
   * ```
   */
  private renderChartContent(chart: Chart, candles: Candles): string {
    const output: string[] = []
    const { chartData } = chart
    chartData.computeHeight(chart.volumePane.height)
    const { visibleCandleSet: candleSet } = chartData
    const graduationsOnRight = CONSTANTS.Y_AXIS_ON_THE_RIGHT
    const renderLine = chart.yAxis.renderLine.bind(chart.yAxis)
    const highlights = chart.highlights || {}
    this.renderChartBody(output, chart, candles, graduationsOnRight, renderLine, highlights)
    if (chart.volumePane.enabled) {
      this.renderVolumePane(output, chart, candles, graduationsOnRight, candleSet)
      const labels = this.renderLabels(chart, chartData.mainCandleSet)
      if (labels) {
        output.push(labels)
      }
    } else {
      output.push(chart.infoBar.render(chartData.mainCandleSet, chartData.width))
    }
    return output.join('')
  }

  /**
   * Sample candles following Python implementation
   *
   * Implements Python's intelligent sampling that preserves important data points.
   * Prioritizes recent data and significant price movements.
   *
   * @param candles - Complete candle dataset
   * @param targetCount - Target number of candles to show
   * @returns Sampled candles for display
   *
   * @example
   * ```typescript
   * const sampled = this.sampleCandles(candles, 120)
   * // Returns intelligently sampled candles
   * ```
   */
  private sampleCandles(candles: Candles, targetCount: number): Candles {
    if (candles.length <= targetCount) {
      return candles
    }
    const sampled: Candles = []
    sampled.push(candles[0])
    const step = Math.max(1, Math.floor(candles.length / (targetCount - 2)))
    for (let i = step; i < candles.length - 1; i += step) {
      if (sampled.length >= targetCount - 1) {
        break
      }
      sampled.push(candles[i])
    }
    sampled.push(candles[candles.length - 1])
    if (sampled.length < targetCount) {
      this.fillRemainingCandles(sampled, candles, targetCount)
    }
    return sampled.slice(0, targetCount)
  }

  /**
   * Fill remaining slots with additional candles
   *
   * Adds more candles to reach the target count while maintaining chronological order.
   *
   * @param sampled - Current sampled candles array
   * @param candles - Original candle array
   * @param targetCount - Target number of candles
   */
  private fillRemainingCandles(sampled: Candles, candles: Candles, targetCount: number): void {
    const remaining = targetCount - sampled.length
    const gapStep = Math.max(1, Math.floor(candles.length / (remaining * 2)))
    for (let i = gapStep; i < candles.length - 1; i += gapStep) {
      if (sampled.length >= targetCount) {
        break
      }
      if (!sampled.includes(candles[i])) {
        const insertIndex = this.findInsertPosition(sampled, candles, i)
        sampled.splice(insertIndex, 0, candles[i])
      }
    }
  }

  /**
   * Find correct position to insert candle
   *
   * Determines the proper chronological position for inserting a new candle.
   *
   * @param sampled - Current sampled candles
   * @param candles - Original candle array
   * @param candleIndex - Index of candle to insert
   * @returns Insert position index
   */
  private findInsertPosition(sampled: Candles, candles: Candles, candleIndex: number): number {
    for (let j = 0; j < sampled.length; j++) {
      if (candles.indexOf(sampled[j]) > candleIndex) {
        return j
      }
    }
    return sampled.length
  }

  /**
   * Render a single candle at given Y coordinate
   *
   * Determines which Unicode character to use for the candle body, wick, or
   * empty space based on the candle's price data and current Y position.
   * Implements precise candle rendering with proper body/wick distinction.
   *
   * @param candle - Candle data to render
   * @param y - Y coordinate (height position)
   * @param yAxis - Y-axis instance for price-to-height conversion
   * @returns Colored Unicode character representing the candle at this position
   *
   * @example
   * ```typescript
   * const candleChar = this.renderCandle(candle, 5, yAxis)
   * // Returns colored Unicode character for this position
   * ```
   */
  private renderCandle(candle: Candle, y: number, yAxis: YAxis): string {
    const heightUnit = y
    const [highY, lowY, maxY, minY] = yAxis.priceToHeights(candle)
    const output = this.determineCandleCharacter(heightUnit, highY, lowY, maxY, minY)
    return this.colorize(candle.type, output)
  }

  /**
   * Determine which Unicode character to use for candle rendering
   *
   * Analyzes the candle's price data and current Y position to determine
   * the appropriate Unicode character for body, wick, or empty space.
   * Implements complex logic for accurate candle representation.
   *
   * @param heightUnit - Current Y coordinate
   * @param highY - High price Y coordinate
   * @param lowY - Low price Y coordinate
   * @param maxY - Maximum body Y coordinate
   * @param minY - Minimum body Y coordinate
   * @returns Unicode character for this position
   *
   * @example
   * ```typescript
   * const char = this.determineCandleCharacter(5, 6.2, 3.8, 5.5, 4.2)
   * // Returns appropriate Unicode character
   * ```
   */
  private determineCandleCharacter(
    heightUnit: number,
    highY: number,
    lowY: number,
    maxY: number,
    minY: number
  ): string {
    const { ceil, floor } = Math
    if (ceil(highY) >= heightUnit && heightUnit >= floor(maxY)) {
      return this.renderUpperCandlePart(heightUnit, highY, maxY)
    }
    if (ceil(minY) >= heightUnit && heightUnit >= floor(lowY)) {
      return this.renderLowerCandlePart(heightUnit, lowY, minY)
    }
    if (maxY >= heightUnit && heightUnit >= ceil(minY)) {
      return CONSTANTS.UNICODE_BODY
    }
    return CONSTANTS.UNICODE_VOID
  }

  /**
   * Render upper part of candle (above body)
   *
   * Handles rendering of the upper wick and top portion of the candle body.
   * Determines appropriate Unicode characters based on price differences and thresholds.
   *
   * @param heightUnit - Current Y coordinate
   * @param highY - High price Y coordinate
   * @param maxY - Maximum body Y coordinate
   * @returns Unicode character for upper candle part
   *
   * @example
   * ```typescript
   * const upperChar = this.renderUpperCandlePart(6, 7.5, 6.2)
   * // Returns appropriate Unicode for upper wick/body
   * ```
   */
  private renderUpperCandlePart(heightUnit: number, highY: number, maxY: number): string {
    const maxDiff = maxY - heightUnit
    const highDiff = highY - heightUnit
    if (maxDiff > CONSTANTS.MAX_DIFF_THRESHOLD) {
      return CONSTANTS.UNICODE_BODY
    }
    if (maxDiff > CONSTANTS.MIN_DIFF_THRESHOLD) {
      return highDiff > CONSTANTS.MAX_DIFF_THRESHOLD ? CONSTANTS.UNICODE_TOP : CONSTANTS.UNICODE_HALF_BODY_BOTTOM
    }
    if (highDiff > CONSTANTS.MAX_DIFF_THRESHOLD) {
      return CONSTANTS.UNICODE_WICK
    }
    if (highDiff > CONSTANTS.MIN_DIFF_THRESHOLD) {
      return CONSTANTS.UNICODE_WICK_UPPER
    }
    return CONSTANTS.UNICODE_VOID
  }

  /**
   * Render lower part of candle (below body)
   *
   * Handles rendering of the lower wick and bottom portion of the candle body.
   * Determines appropriate Unicode characters based on price differences and thresholds.
   *
   * @param heightUnit - Current Y coordinate
   * @param lowY - Low price Y coordinate
   * @param minY - Minimum body Y coordinate
   * @returns Unicode character for lower candle part
   *
   * @example
   * ```typescript
   * const lowerChar = this.renderLowerCandlePart(3, 2.8, 3.5)
   * // Returns appropriate Unicode for lower wick/body
   * ```
   */
  private renderLowerCandlePart(heightUnit: number, lowY: number, minY: number): string {
    const minDiff = minY - heightUnit
    const lowDiff = lowY - heightUnit
    if (minDiff < CONSTANTS.MIN_DIFF_THRESHOLD) {
      return CONSTANTS.UNICODE_BODY
    }
    if (minDiff < CONSTANTS.MAX_DIFF_THRESHOLD) {
      return lowDiff < CONSTANTS.MIN_DIFF_THRESHOLD ? CONSTANTS.UNICODE_BOTTOM : CONSTANTS.UNICODE_HALF_BODY_TOP
    }
    if (lowDiff < CONSTANTS.MIN_DIFF_THRESHOLD) {
      return CONSTANTS.UNICODE_WICK
    }
    if (lowDiff < CONSTANTS.MAX_DIFF_THRESHOLD) {
      return CONSTANTS.UNICODE_WICK_LOWER
    }
    return CONSTANTS.UNICODE_VOID
  }

  /**
   * Add colored field to labels array
   *
   * Helper method for building colored information fields in the chart labels.
   * Splits field into label and value, then applies color to the value portion.
   *
   * @param parts - Array of label parts to append to
   * @param field - Field string in format "label: value"
   * @param color - RGB color to apply to the value
   *
   * @example
   * ```typescript
   * this.addColoredField(parts, 'Price: 100.50', [52, 208, 88])
   * // Adds colored field to parts array
   * ```
   */
  private addColoredField(parts: string[], field: string, color: RGBColor): void {
    if (field) {
      const [label, value] = field.split(': ')
      parts.push(`${label}: ${truecolor(value, ...color)}`)
    }
  }

  /**
   * Render labels at the bottom of the volume pane with colors
   *
   * Creates a formatted information bar with colored statistics including
   * price, highest/lowest values, variation, average, and volume.
   * Each statistic is color-coded for better visual distinction.
   *
   * @param chart - Chart instance containing info bar configuration
   * @param stats - Candle set statistics to display
   * @returns Formatted and colored labels string with center padding
   *
   * @example
   * ```typescript
   * const labels = this.renderLabels(chart, stats)
   * // Returns: "BTC/USDT | Price: 115,405.70 | Highest: 119,812.00..."
   * ```
   */
  private renderLabels(chart: Chart, stats: CandleSetStats): string {
    const parts: string[] = []
    if (chart.infoBar.name) {
      parts.push(truecolor(chart.infoBar.name, 255, 255, 255))
    }
    this.addColoredField(parts, chart.infoBar.renderPrice(stats), [52, 208, 88])
    this.addColoredField(parts, chart.infoBar.renderHighest(stats), [52, 208, 88])
    this.addColoredField(parts, chart.infoBar.renderLowest(stats), [234, 74, 90])
    const variation = chart.infoBar.renderVariation(stats)
    if (variation) {
      const [label, value] = variation.split(': ')
      const isPositive = value.includes('+')
      const color: RGBColor = isPositive ? [52, 208, 88] : [234, 74, 90]
      parts.push(`${label}: ${truecolor(value, ...color)}`)
    }
    const average = chart.infoBar.renderAverage(stats)
    if (average) {
      const [label, value] = average.split(': ')
      const currentPrice = stats.lastPrice
      const avgPrice = stats.average
      let color: RGBColor
      if (currentPrice > avgPrice) {
        color = [234, 74, 90]
      } else if (currentPrice < avgPrice) {
        color = [52, 208, 88]
      } else {
        color = [255, 255, 0]
      }
      parts.push(`${label}: ${truecolor(value, ...color)}`)
    }
    const volume = chart.infoBar.renderVolume(stats)
    if (volume) {
      const [label, value] = volume.split(': ')
      parts.push(`${label}: ${truecolor(value, 52, 208, 88)}`)
    }
    const labelsText = parts.join(' | ')
    const chartAreaWidth = chart.chartData.width - CONSTANTS.WIDTH
    const textLength = labelsText.replace(/\x1b\[[0-9;]*m/g, '').length
    const padding = Math.max(0, Math.floor((chartAreaWidth - textLength) / 2))
    return ' '.repeat(padding) + labelsText
  }

  /**
   * Render the complete chart with dynamic font scaling
   *
   * Generates the complete ASCII chart with dynamic font size adjustment.
   * More data = smaller font size for optimal display.
   * Now properly handles async rendering for auto-resize scenarios.
   * Optimized for smooth re-rendering in watch mode.
   *
   * @param chart - Chart instance containing all rendering data
   * @returns Complete ASCII chart string ready for console output
   *
   * @example
   * ```typescript
   * const chartString = await renderer.render(chart)
   * console.log(chartString)
   * ```
   */
  async render(chart: Chart): Promise<string> {
    const { chartData } = chart
    chartData.computeHeight(chart.volumePane.height)
    const { visibleCandleSet: candleSet } = chartData
    const { candles } = candleSet
    const terminalDimensions = this.getTerminalDimensions()
    const availableWidth =
      terminalDimensions.width - CONSTANTS.WIDTH - (CONSTANTS.Y_AXIS_ON_THE_RIGHT ? 0 : CONSTANTS.MARGIN_RIGHT)
    const candlesToShow = Math.min(candles.length, Math.floor(availableWidth * 2.0))
    const candlesToRender = this.sampleCandles(candles, candlesToShow)
    return this.renderChartContent(chart, candlesToRender)
  }

  /**
   * Render the main chart body
   *
   * Renders all chart lines from top to bottom, including Y-axis labels
   * and candle representations. Handles both left and right Y-axis positioning.
   *
   * @param output - Output string array to append to
   * @param chart - Chart instance with rendering data
   * @param candles - Array of candles to render
   * @param graduationsOnRight - Whether Y-axis is on the right side
   * @param renderLine - Function to render Y-axis line
   * @param highlights - Price highlights for Y-axis
   *
   * @example
   * ```typescript
   * this.renderChartBody(output, chart, candles, 2, false, renderLine, highlights)
   * ```
   */
  private renderChartBody(
    output: string[],
    chart: Chart,
    candles: Candles,
    graduationsOnRight: boolean,
    renderLine: (y: number, highlights: ChartHighlights) => string,
    highlights: ChartHighlights
  ): void {
    for (let y = chart.chartData.height; y > 0; y--) {
      this.renderChartLine(output, chart, candles, graduationsOnRight, renderLine, highlights, y)
    }
  }

  /**
   * Render a single chart line
   *
   * Renders one horizontal line of the chart including Y-axis labels
   * and candle characters for all visible candles at this Y position.
   *
   * @param output - Output string array to append to
   * @param chart - Chart instance with rendering data
   * @param candles - Array of candles to render
   * @param graduationsOnRight - Whether Y-axis is on the right side
   * @param renderLine - Function to render Y-axis line
   * @param highlights - Price highlights for Y-axis
   * @param y - Current Y coordinate to render
   *
   * @example
   * ```typescript
   * this.renderChartLine(output, chart, candles, 2, false, renderLine, highlights, 5)
   * ```
   */
  private renderChartLine(
    output: string[],
    chart: Chart,
    candles: Candles,
    graduationsOnRight: boolean,
    renderLine: (y: number, highlights: ChartHighlights) => string,
    highlights: ChartHighlights,
    y: number
  ): void {
    if (graduationsOnRight) {
      output.push('\n')
    } else {
      output.push('\n', renderLine(y, highlights))
    }
    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i]
      output.push(this.renderCandle(candle, y, chart.yAxis))
    }
    if (graduationsOnRight) {
      output.push(renderLine(y, highlights))
    }
  }

  /**
   * Render the volume pane
   *
   * Renders the volume bars below the main chart if volume pane is enabled.
   * Creates visual representation of trading volume for each candle.
   *
   * @param output - Output string array to append to
   * @param chart - Chart instance with rendering data
   * @param candles - Array of candles to render volume for
   * @param graduationsOnRight - Whether Y-axis is on the right side
   * @param candleSet - Candle set with volume statistics
   *
   * @example
   * ```typescript
   * this.renderVolumePane(output, chart, candles, 2, false, candleSet)
   * ```
   */
  private renderVolumePane(
    output: string[],
    chart: Chart,
    candles: Candles,
    graduationsOnRight: boolean,
    candleSet: CandleSet
  ): void {
    const renderEmpty = chart.yAxis.renderEmpty.bind(chart.yAxis)
    const render = chart.volumePane.render.bind(chart.volumePane)
    const { maxVolume } = candleSet
    for (let y = chart.volumePane.height; y > 0; y--) {
      this.renderVolumeLine(output, candles, graduationsOnRight, renderEmpty, render, maxVolume, y)
    }
    output.push('\n')
    output.push('\n')
  }

  /**
   * Render a single volume line
   *
   * Renders one horizontal line of the volume pane including empty space
   * and volume bars for all visible candles at this Y position.
   *
   * @param output - Output string array to append to
   * @param candles - Array of candles to render volume for
   * @param graduationsOnRight - Whether Y-axis is on the right side
   * @param renderEmpty - Function to render empty Y-axis space
   * @param render - Function to render volume bar
   * @param maxVolume - Maximum volume for scaling
   * @param y - Current Y coordinate to render
   *
   * @example
   * ```typescript
   * this.renderVolumeLine(output, candles, 2, false, renderEmpty, render, 1000, 3)
   * ```
   */
  private renderVolumeLine(
    output: string[],
    candles: Candles,
    graduationsOnRight: boolean,
    renderEmpty: () => string,
    render: (candle: Candle, y: number, maxVolume: number) => string,
    maxVolume: number,
    y: number
  ): void {
    if (graduationsOnRight) {
      output.push('\n')
    } else {
      output.push('\n', renderEmpty())
    }
    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i]
      output.push(render(candle, y, maxVolume))
    }
    if (graduationsOnRight) {
      output.push(renderEmpty())
    }
  }
}
