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
 * - Price highlighting and information display
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
   * Uses truecolor ANSI escape sequences for precise color control across
   * different terminal environments.
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
   * Render chart content with given candles
   *
   * Separates chart content rendering from terminal size calculations.
   * Uses CONSTANTS for consistent rendering and handles volume pane
   * and information bar display based on chart configuration.
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
   * Render a single candle
   *
   * Renders one candle at the specified Y position using the Y-axis for price conversion.
   * Applies appropriate color based on candle type (bullish/bearish) and determines
   * the correct Unicode character for the candle representation.
   *
   * @param candle - Candle data to render
   * @param y - Y coordinate for rendering
   * @param yAxis - Y-axis instance for price conversion
   * @returns Colored candle character string
   *
   * @example
   * ```typescript
   * const candleChar = this.renderCandle(candle, 5, yAxis)
   * // Returns colored candle character
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
   * Implements complex logic for accurate candle representation and handles
   * edge cases for proper visual display.
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
   * Determines appropriate Unicode characters based on price differences and thresholds
   * to create accurate visual representation of the candle's upper portion.
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
   * Determines appropriate Unicode characters based on price differences and thresholds
   * to create accurate visual representation of the candle's lower portion.
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
   * Splits field into label and value, then applies color to the value portion
   * for enhanced visual distinction in the information display.
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
   * Each statistic is color-coded for better visual distinction and
   * provides comprehensive market information display.
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
   * Render the complete chart
   *
   * Main rendering method that orchestrates the entire chart rendering process.
   * Handles terminal size detection, candle sampling, and output formatting.
   * Supports async rendering for large datasets and provides comprehensive
   * error handling for robust chart display.
   *
   * @param chart - Chart instance to render
   * @returns Promise that resolves to complete chart string
   *
   * @example
   * ```typescript
   * const chartString = await renderer.render(chart)
   * console.log(chartString)
   * ```
   */
  async render(chart: Chart): Promise<string> {
    try {
      const {
        chartData: {
          visibleCandleSet: { candles }
        }
      } = chart
      if (candles.length === 0) {
        return 'No data available'
      }
      return this.renderChartContent(chart, candles)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Chart rendering failed: ${errorMessage}`)
    }
  }

  /**
   * Render chart body
   *
   * Renders the main chart area including candles and Y-axis graduations.
   * Handles both left and right Y-axis positioning and manages the complete
   * chart display layout with proper line-by-line rendering.
   *
   * @param output - Output string array to append to
   * @param chart - Chart instance with rendering data
   * @param candles - Array of candles to render
   * @param graduationsOnRight - Whether Y-axis is on the right side
   * @param renderLine - Function to render Y-axis line
   * @param highlights - Chart highlights for price coloring
   *
   * @example
   * ```typescript
   * this.renderChartBody(output, chart, candles, false, renderLine, highlights)
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
    const {
      chartData: { height }
    } = chart
    for (let y = height; y > 0; y--) {
      this.renderChartLine(output, chart, candles, graduationsOnRight, renderLine, highlights, y)
    }
  }

  /**
   * Render a single chart line
   *
   * Renders one horizontal line of the chart including Y-axis graduations
   * and candles at the specified Y position. Handles proper positioning
   * of Y-axis elements and candle rendering for each line.
   *
   * @param output - Output string array to append to
   * @param chart - Chart instance with rendering data
   * @param candles - Array of candles to render
   * @param graduationsOnRight - Whether Y-axis is on the right side
   * @param renderLine - Function to render Y-axis line
   * @param highlights - Chart highlights for price coloring
   * @param y - Current Y coordinate to render
   *
   * @example
   * ```typescript
   * this.renderChartLine(output, chart, candles, false, renderLine, highlights, 5)
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
   * Creates visual representation of trading volume for each candle and
   * provides additional market analysis information through volume display.
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
   * and volume bars for all visible candles at this Y position. Handles
   * proper volume scaling and visual representation for each candle.
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
