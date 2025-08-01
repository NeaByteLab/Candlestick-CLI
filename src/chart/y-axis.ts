import { CONSTANTS } from '@/constants'
import { color, roundPrice } from '@/utils/core'
import { ChartData } from '@/chart/chart-data'
import type { Candle, ChartHighlights } from '@/types/candlestick'

/**
 * YAxis handles price-to-height conversion and axis rendering
 *
 * Manages Y-axis display with price labels, highlights, and coordinate conversion.
 * Provides price-to-height mapping for accurate candle positioning and supports
 * customizable price highlighting with color coding.
 *
 * @example
 * ```typescript
 * import { YAxis } from '@/chart/y-axis'
 *
 * const yAxis = new YAxis(chartData)
 * const [highY, lowY, maxY, minY] = yAxis.priceToHeights(candle)
 * const axisLine = yAxis.renderLine(5, highlights)
 * ```
 */
export class YAxis {
  /** Chart data instance for coordinate calculations */
  chartData: ChartData

  /**
   * Initialize YAxis with chart data
   *
   * Creates a new YAxis instance with the provided chart data for
   * coordinate calculations and price-to-height conversions.
   *
   * @param chartData - Chart data instance for coordinate calculations
   *
   * @example
   * ```typescript
   * const yAxis = new YAxis(chartData)
   * ```
   */
  constructor(chartData: ChartData) {
    this.chartData = chartData
  }

  /**
   * Convert candle prices to height coordinates
   *
   * Transforms candle price data into Y-axis coordinates for rendering.
   * Calculates high, low, max, and min Y positions based on chart scaling
   * and price ranges. Essential for accurate candle positioning.
   *
   * @param candle - Candle to convert to height coordinates
   * @returns Tuple of [high_y, low_y, max_y, min_y] coordinates
   *
   * @example
   * ```typescript
   * const [highY, lowY, maxY, minY] = yAxis.priceToHeights(candle)
   * // Returns Y coordinates for candle rendering
   * ```
   */
  priceToHeights(candle: Candle): [number, number, number, number] {
    const { height } = this.chartData
    const { visibleCandleSet: candleSet } = this.chartData
    const minOpen = Math.min(candle.close, candle.open)
    const maxOpen = Math.max(candle.close, candle.open)
    const minValue = candleSet.minPrice
    const diff = candleSet.maxPrice - minValue || 1
    return [
      ((candle.high - minValue) / diff) * height,
      ((candle.low - minValue) / diff) * height,
      ((maxOpen - minValue) / diff) * height,
      ((minOpen - minValue) / diff) * height
    ]
  }

  /**
   * Render a line of the Y-axis
   *
   * Generates Y-axis line content including price labels and highlights.
   * Determines whether to show tick marks or empty space based on spacing
   * configuration. Supports both left and right Y-axis positioning.
   *
   * @param y - Y coordinate to render
   * @param highlights - Price highlights for color coding
   * @returns Rendered Y-axis line string
   *
   * @example
   * ```typescript
   * const line = yAxis.renderLine(5, { '100.50': 'red' })
   * // Returns formatted Y-axis line with highlights
   * ```
   */
  renderLine(y: number, highlights: ChartHighlights = {}): string {
    if (y === this.chartData.height || y === 1) {
      return this.renderTick(y, highlights)
    }
    return y % CONSTANTS.Y_AXIS_SPACING ? this.renderEmpty(y, highlights) : this.renderTick(y, highlights)
  }

  /**
   * Render price with highlighting
   *
   * Generates price labels with optional highlighting based on configured
   * price highlights. Supports both exact price matching and range-based
   * highlighting for price levels.
   *
   * @param y - Y coordinate for price calculation
   * @param highlights - Price highlights configuration
   * @returns Tuple of [hasSpecialPrice, priceString] with highlighting
   *
   * @example
   * ```typescript
   * const [hasHighlight, priceStr] = this.renderPrice(5, { '100.50': 'red' })
   * // Returns price string with optional highlighting
   * ```
   */
  private renderPrice(y: number, highlights: ChartHighlights): [boolean, string] {
    const { chartData } = this
    const { visibleCandleSet } = chartData
    const { minPrice: minValue, maxPrice: maxValue } = visibleCandleSet
    const { height } = chartData
    const cellMinLength = CONSTANTS.CHAR_PRECISION + CONSTANTS.DEC_PRECISION + 1
    const formatPrice = (value: number): string => roundPrice(value)
    let price: string
    if (y === height) {
      price = formatPrice(maxValue)
    } else if (y === 1) {
      price = formatPrice(minValue)
    } else {
      const interpolatedValue = minValue + ((y - 1) * (maxValue - minValue)) / (height - 1)
      price = formatPrice(interpolatedValue)
    }
    const priceUpper = roundPrice(minValue + (y * (maxValue - minValue)) / height)
    let hasSpecialPrice = false
    let customColor: string | [number, number, number] = ''
    for (const [targetPrice, targetColor] of Object.entries(highlights)) {
      const targetPriceNum = parseFloat(targetPrice.replace(/,/g, ''))
      const priceNum = parseFloat(price.replace(/,/g, ''))
      if (Math.abs(targetPriceNum - priceNum) < 0.01) {
        hasSpecialPrice = true
        customColor = targetColor
        break
      }
      const priceUpperNum = parseFloat(priceUpper.replace(/,/g, ''))
      if (!(priceNum <= targetPriceNum && targetPriceNum < priceUpperNum)) {
        continue
      }
      hasSpecialPrice = true
      customColor = targetColor
      break
    }
    const priceStr = CONSTANTS.Y_AXIS_ON_THE_RIGHT
      ? ` ${color(`${CONSTANTS.UNICODE_Y_AXIS_RIGHT} ${price.padEnd(cellMinLength)}`, customColor)}`
      : `${color(`${price.padEnd(cellMinLength)} ${CONSTANTS.UNICODE_Y_AXIS_LEFT}`, customColor)}${' '.repeat(CONSTANTS.MARGIN_RIGHT)}`
    return [hasSpecialPrice, priceStr]
  }

  /**
   * Render empty line
   *
   * Generates empty Y-axis line content with optional price highlighting.
   * Used for lines without tick marks to maintain consistent spacing.
   * Supports both left and right Y-axis positioning.
   *
   * @param y - Y coordinate (optional, for highlighting)
   * @param highlights - Price highlights for optional highlighting
   * @returns Rendered empty line string
   *
   * @example
   * ```typescript
   * const emptyLine = yAxis.renderEmpty(3, { '100.50': 'red' })
   * // Returns empty line with optional highlighting
   * ```
   */
  renderEmpty(y?: number, highlights: ChartHighlights = {}): string {
    if (highlights && y !== undefined) {
      const [, price] = this.renderPrice(y, highlights)
      return price
    }
    if (CONSTANTS.Y_AXIS_ON_THE_RIGHT) {
      return ` ${CONSTANTS.UNICODE_Y_AXIS}`
    }
    const cell = ' '.repeat(CONSTANTS.CHAR_PRECISION + CONSTANTS.DEC_PRECISION + 2)
    const margin = ' '.repeat(CONSTANTS.MARGIN_RIGHT)
    return `${cell}${CONSTANTS.UNICODE_Y_AXIS}${margin}`
  }

  /**
   * Render tick with price
   *
   * Generates Y-axis tick line with price label and optional highlighting.
   * Used for lines that should display price information. Delegates to
   * renderPrice for actual price formatting and highlighting.
   *
   * @param y - Y coordinate to render tick for
   * @param highlights - Price highlights for color coding
   * @returns Rendered tick string with price label
   *
   * @example
   * ```typescript
   * const tick = this.renderTick(5, { '100.50': 'red' })
   * // Returns tick line with price and highlighting
   * ```
   */
  private renderTick(y: number, highlights: ChartHighlights): string {
    const [, price] = this.renderPrice(y, highlights)
    return price
  }
}
