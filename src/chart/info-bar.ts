import { LABELS } from '@/constants'
import { fnum, formatPrice } from '@/utils/core'
import type { CandleSetStats, ChartLabels } from '@/types/candlestick'

/**
 * InfoBar displays chart statistics and information
 *
 * Provides formatted display of chart statistics including price information,
 * volume data, and variation metrics. Supports customizable labels and
 * comprehensive data formatting for terminal output.
 *
 * @example
 * ```typescript
 * import { InfoBar } from '@/chart/info-bar'
 *
 * const infoBar = new InfoBar('BTC/USDT')
 * const stats = { lastPrice: 50000, maxPrice: 52000, minPrice: 48000 }
 * const info = infoBar.render(stats, 120)
 * ```
 */
export class InfoBar {
  /** Chart name displayed in the info bar */
  name: string
  /** Chart labels configuration */
  labels: ChartLabels

  /**
   * Initialize InfoBar with chart name
   *
   * Creates a new InfoBar instance with the specified chart name and
   * default label configuration. Sets up the display structure for
   * chart statistics.
   *
   * @param name - Chart name to display
   *
   * @example
   * ```typescript
   * const infoBar = new InfoBar('BTC/USDT 4H Chart')
   * ```
   */
  constructor(name: string) {
    this.name = name
    this.labels = { ...LABELS }
  }

  /**
   * Format price with consistent decimal display
   *
   * Internal helper method for formatting price values with consistent
   * decimal precision and locale-specific formatting.
   *
   * @param value - Price value to format
   * @returns Formatted price string
   *
   * @example
   * ```typescript
   * const formatted = this.formatPrice(1234.56) // "1,234.56"
   * ```
   */
  private formatPrice = (value: number): string => formatPrice(value)

  /**
   * Render price field with label
   *
   * Helper method for rendering price fields with proper label formatting.
   * Handles cases where labels might be undefined or empty.
   *
   * @param label - Label text for the field
   * @param value - Price value to display
   * @returns Formatted price field string or empty string if no label
   *
   * @example
   * ```typescript
   * const field = this.renderPriceField('Price', 50000) // "Price: 50,000.00"
   * ```
   */
  private renderPriceField = (label: string | undefined, value: number): string => {
    if (!label) {
      return ''
    }
    return `${label}: ${this.formatPrice(value)}`
  }

  /**
   * Render average price
   *
   * Formats and displays the average price from chart statistics.
   * Uses the configured average label and proper price formatting.
   *
   * @param stats - Candle set statistics
   * @returns Formatted average price string or empty string if no label
   *
   * @example
   * ```typescript
   * const average = infoBar.renderAverage({ average: 50000 })
   * // Returns: "Avg.: 50,000.00"
   * ```
   */
  renderAverage(stats: CandleSetStats): string {
    return this.renderPriceField(this.labels.average, stats.average)
  }

  /**
   * Render highest price
   *
   * Formats and displays the highest price from chart statistics.
   * Uses the configured highest label and proper price formatting.
   *
   * @param stats - Candle set statistics
   * @returns Formatted highest price string or empty string if no label
   *
   * @example
   * ```typescript
   * const highest = infoBar.renderHighest({ maxPrice: 52000 })
   * // Returns: "Highest: 52,000.00"
   * ```
   */
  renderHighest(stats: CandleSetStats): string {
    return this.renderPriceField(this.labels.highest, stats.maxPrice)
  }

  /**
   * Render lowest price
   *
   * Formats and displays the lowest price from chart statistics.
   * Uses the configured lowest label and proper price formatting.
   *
   * @param stats - Candle set statistics
   * @returns Formatted lowest price string or empty string if no label
   *
   * @example
   * ```typescript
   * const lowest = infoBar.renderLowest({ minPrice: 48000 })
   * // Returns: "Lowest: 48,000.00"
   * ```
   */
  renderLowest(stats: CandleSetStats): string {
    return this.renderPriceField(this.labels.lowest, stats.minPrice)
  }

  /**
   * Render current price
   *
   * Formats and displays the current (last) price from chart statistics.
   * Uses the configured price label and proper price formatting.
   *
   * @param stats - Candle set statistics
   * @returns Formatted current price string or empty string if no label
   *
   * @example
   * ```typescript
   * const price = infoBar.renderPrice({ lastPrice: 50000 })
   * // Returns: "Price: 50,000.00"
   * ```
   */
  renderPrice(stats: CandleSetStats): string {
    return this.renderPriceField(this.labels.price, stats.lastPrice)
  }

  /**
   * Render price variation
   *
   * Formats and displays the price variation percentage from chart statistics.
   * Includes proper sign (+ or -) and percentage formatting. Only displays
   * if the variation label is configured.
   *
   * @param stats - Candle set statistics
   * @returns Formatted variation string or empty string if no label
   *
   * @example
   * ```typescript
   * const variation = infoBar.renderVariation({ variation: 2.5 })
   * // Returns: "Var.: +2.5%"
   * ```
   */
  renderVariation(stats: CandleSetStats): string {
    if (!this.labels.variation) {
      return ''
    }
    const { variation } = stats
    const sign = variation >= 0 ? '+' : ''
    const formatted = fnum(variation)
    return `${this.labels.variation}: ${sign}${formatted}%`
  }

  /**
   * Render volume information
   *
   * Formats and displays the cumulative volume from chart statistics.
   * Uses locale-specific number formatting for large volume values.
   * Only displays if the volume label is configured.
   *
   * @param stats - Candle set statistics
   * @returns Formatted volume string or empty string if no label
   *
   * @example
   * ```typescript
   * const volume = infoBar.renderVolume({ cumulativeVolume: 1500000 })
   * // Returns: "Cum. Vol.: 1,500,000"
   * ```
   */
  renderVolume(stats: CandleSetStats): string {
    if (!this.labels.volume) {
      return ''
    }
    const formatted = Math.floor(stats.cumulativeVolume).toLocaleString()
    return `${this.labels.volume}: ${formatted}`
  }

  /**
   * Render the complete info bar
   *
   * Generates the complete information bar string with all available statistics.
   * Includes chart name, price information, volume data, and variation metrics.
   * Centers the content within the available width for proper display.
   *
   * @param stats - Candle set statistics to display
   * @param width - Available width for the info bar
   * @returns Formatted info bar string with center padding
   *
   * @example
   * ```typescript
   * const infoBar = new InfoBar('BTC/USDT')
   * const stats = { lastPrice: 50000, maxPrice: 52000, minPrice: 48000 }
   * const info = infoBar.render(stats, 120)
   * // Returns centered info bar string
   * ```
   */
  render(stats: CandleSetStats, width: number): string {
    const parts: string[] = []
    if (this.name) {
      parts.push(this.name)
    }
    const price = this.renderPrice(stats)
    if (price) {
      parts.push(price)
    }
    const highest = this.renderHighest(stats)
    if (highest) {
      parts.push(highest)
    }
    const lowest = this.renderLowest(stats)
    if (lowest) {
      parts.push(lowest)
    }
    const variation = this.renderVariation(stats)
    if (variation) {
      parts.push(variation)
    }
    const average = this.renderAverage(stats)
    if (average) {
      parts.push(average)
    }
    const volume = this.renderVolume(stats)
    if (volume) {
      parts.push(volume)
    }
    const result = parts.join(' | ')
    const padding = Math.max(0, Math.floor((width - result.length) / 2))
    return ' '.repeat(padding) + result
  }
}
