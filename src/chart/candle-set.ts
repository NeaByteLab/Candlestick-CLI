import type { Candles, CandleSetStats } from '@/types/candlestick'

/**
 * CandleSet manages candle data and computes statistics
 *
 * Handles candle collection management and automatic statistical calculations.
 * Provides price ranges, volume metrics, and price variation analysis.
 * Used by chart rendering system for data processing and analysis.
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
   * Creates a new CandleSet instance and computes all statistics from the provided data.
   * Handles empty datasets gracefully by resetting all statistics to zero.
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
   * Useful for streaming data or incremental updates. Maintains data integrity.
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
   * Replaces the entire candle collection with new data and recomputes all statistics.
   * Used when updating the complete dataset. Resets all computed metrics.
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
   * Calculates comprehensive statistics from the current candle collection.
   * Includes price ranges, volume statistics, price variation, average price, and last price.
   * Called automatically when candles are added or updated.
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
   * Returns a comprehensive statistics object containing all computed metrics.
   * Primary interface for accessing chart statistics used by the rendering system.
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
