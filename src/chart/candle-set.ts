import type { Candles, CandleSetStats } from '@/types/candlestick'

/**
 * CandleSet manages a collection of candles and computes statistics
 *
 * Provides functionality to manage a set of candlestick data and automatically
 * compute various statistics including price ranges, volume metrics, and
 * price variations. Used by the chart rendering system for data analysis.
 * Implements efficient statistical calculations and data management.
 *
 * @example
 * ```typescript
 * import { CandleSet } from '@/chart/candle-set'
 *
 * const candles = [
 *   { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: 1640995200000, type: 1 },
 *   { open: 103, high: 108, low: 102, close: 106, volume: 1200, timestamp: 1640998800000, type: 1 }
 * ]
 *
 * const candleSet = new CandleSet(candles)
 * const stats = candleSet.getStats()
 * console.log(stats.minPrice, stats.maxPrice) // 99, 108
 * ```
 */
export class CandleSet {
  /** Array of candle data */
  candles: Candles
  /** Minimum price in the candle set */
  minPrice: number = 0
  /** Maximum price in the candle set */
  maxPrice: number = 0
  /** Minimum volume in the candle set */
  minVolume: number = 0
  /** Maximum volume in the candle set */
  maxVolume: number = 0
  /** Price variation percentage from first to last candle */
  variation: number = 0
  /** Average price across all candles */
  average: number = 0
  /** Last (most recent) price */
  lastPrice: number = 0
  /** Total cumulative volume */
  cumulativeVolume: number = 0

  /**
   * Initialize CandleSet with candle data
   *
   * Creates a new CandleSet instance and automatically computes all statistics
   * from the provided candle data. Handles empty datasets gracefully.
   *
   * @param candles - Array of candle data to initialize with
   *
   * @example
   * ```typescript
   * const candleSet = new CandleSet(candleData)
   * console.log(candleSet.minPrice, candleSet.maxPrice)
   * ```
   */
  constructor(candles: Candles) {
    this.candles = candles
    this.computeAll()
  }

  /**
   * Add candles to the set
   *
   * Appends new candles to the existing collection and recomputes all statistics.
   * This method is useful for streaming data or incremental updates.
   * Maintains data integrity and updates all computed metrics.
   *
   * @param newCandles - Array of candles to add to the set
   *
   * @example
   * ```typescript
   * const candleSet = new CandleSet(initialCandles)
   * candleSet.addCandles(newCandles)
   * ```
   */
  addCandles(newCandles: Candles): void {
    this.candles.push(...newCandles)
    this.computeAll()
  }

  /**
   * Set candles and recompute statistics
   *
   * Replaces the entire candle collection with new data and recomputes all
   * statistics. This method is typically used when updating the entire dataset.
   * Resets all computed metrics and recalculates from scratch.
   *
   * @param newCandles - New array of candles to replace the current set
   *
   * @example
   * ```typescript
   * const candleSet = new CandleSet(initialCandles)
   * candleSet.setCandles(updatedCandles)
   * ```
   */
  setCandles(newCandles: Candles): void {
    this.candles = newCandles
    this.computeAll()
  }

  /**
   * Compute all statistics from candles
   *
   * Calculates comprehensive statistics from the current candle collection:
   * - Price ranges (min/max)
   * - Volume statistics (min/max/cumulative)
   * - Price variation percentage
   * - Average price
   * - Last price
   *
   * This method is called automatically when candles are added or updated.
   * Handles edge cases like empty datasets and missing volume data.
   *
   * @example
   * ```typescript
   * candleSet.computeAll() // Called automatically, but can be called manually
   * ```
   */
  private computeAll(): void {
    if (this.candles.length === 0) {
      this.resetStats()
      return
    }
    const prices = this.candles.flatMap(c => [c.high, c.low])
    this.minPrice = Math.min(...prices)
    this.maxPrice = Math.max(...prices)
    const volumes = this.candles.map(c => c.volume).filter((vol): vol is number => vol !== undefined)
    if (volumes.length > 0) {
      this.minVolume = Math.min(...volumes)
      this.maxVolume = Math.max(...volumes)
      this.cumulativeVolume = volumes.reduce((sum, vol) => sum + vol, 0)
    } else {
      this.minVolume = 0
      this.maxVolume = 0
      this.cumulativeVolume = 0
    }
    const firstPrice = this.candles[0].open
    const lastPrice = this.candles[this.candles.length - 1].close
    this.lastPrice = lastPrice
    this.variation = ((lastPrice - firstPrice) / firstPrice) * 100
    this.average = prices.reduce((sum, price) => sum + price, 0) / prices.length
  }

  /**
   * Reset all statistics to zero
   *
   * Clears all computed statistics and sets them to default values.
   * Called when the candle collection is empty or needs to be reset.
   * Ensures consistent state when no data is available.
   *
   * @example
   * ```typescript
   * candleSet.resetStats() // Called automatically when no candles
   * ```
   */
  private resetStats(): void {
    this.minPrice = 0
    this.maxPrice = 0
    this.minVolume = 0
    this.maxVolume = 0
    this.variation = 0
    this.average = 0
    this.lastPrice = 0
    this.cumulativeVolume = 0
  }

  /**
   * Get statistics as a structured object
   *
   * Returns a comprehensive statistics object containing all computed metrics
   * from the candle collection. This is the primary interface for accessing
   * chart statistics and is used by the rendering system.
   *
   * @returns Object containing all candle set statistics
   *
   * @example
   * ```typescript
   * const stats = candleSet.getStats()
   * console.log(`Price range: ${stats.minPrice} - ${stats.maxPrice}`)
   * console.log(`Variation: ${stats.variation}%`)
   * console.log(`Volume: ${stats.cumulativeVolume}`)
   * ```
   */
  getStats(): CandleSetStats {
    return {
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minVolume: this.minVolume,
      maxVolume: this.maxVolume,
      variation: this.variation,
      average: this.average,
      lastPrice: this.lastPrice,
      cumulativeVolume: this.cumulativeVolume
    }
  }
}
