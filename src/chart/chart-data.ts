import { CONSTANTS } from '@/constants'
import { CandleSet } from '@/chart/candle-set'
import type { Candles, TerminalSize } from '@/types/candlestick'

/**
 * ChartData manages chart dimensions and visible candles
 *
 * Handles chart sizing, terminal detection, and candle visibility calculations.
 * Implements scaling with configurable margins and supports fit-to-data and fixed-range modes.
 * Provides responsive chart sizing and data sampling for optimal display.
 *
 * @example
 * ```typescript
 * import { ChartData } from '@/chart/chart-data'
 *
 * const chartData = new ChartData(candles, { width: 120, height: 30 })
 * chartData.setMargins(3, 4, 2, 0)
 * chartData.setScalingMode('fit')
 * ```
 */
export class ChartData {
  /** Main candle set containing all data */
  mainCandleSet: CandleSet
  /** Visible candle set for rendering */
  visibleCandleSet: CandleSet
  /** Current terminal dimensions */
  terminalSize: TerminalSize = { width: 0, height: 0 }
  /** Chart height in characters */
  height: number = 0
  /** Chart width in characters */
  width: number = 0

  /**
   * Initialize ChartData with candles and options
   *
   * Creates a new ChartData instance with candle data and optional dimensions.
   * Automatically detects terminal size if dimensions are not provided.
   * Sets up main and visible candle sets for data management and rendering.
   *
   * @param candles - Array of candle data to initialize with
   * @param options - Optional chart dimensions and configuration
   *
   * @example
   * ```typescript
   * const chartData = new ChartData(candles, { width: 120, height: 30 })
   * ```
   */
  constructor(candles: Candles, options: { width?: number; height?: number } = {}) {
    this.mainCandleSet = new CandleSet(candles)
    this.visibleCandleSet = new CandleSet([])
    const { width = 0, height = 0 } = options
    this.setSize(width || this.getTerminalSize().width, height || this.getTerminalSize().height)
    this.computeVisibleCandles()
  }

  /**
   * Get terminal size with fallback
   *
   * Attempts to detect the current terminal dimensions using process.stdout.
   * Falls back to reasonable defaults if terminal detection fails.
   * Provides consistent sizing across different environments and platforms.
   *
   * @returns Terminal dimensions object with width and height
   *
   * @example
   * ```typescript
   * const terminalSize = chartData.getTerminalSize()
   * console.log(`Terminal: ${terminalSize.width}x${terminalSize.height}`)
   * ```
   */
  getTerminalSize(): TerminalSize {
    if (typeof globalThis.process === 'undefined' || !globalThis.process.stdout) {
      return { width: 120, height: 30 }
    }
    const size = this.tryGetWindowSize()
    if (size) {
      return size
    }
    const size2 = this.tryGetStdoutSize()
    if (size2) {
      return size2
    }
    const size3 = this.tryGetEnvSize()
    if (size3) {
      return size3
    }
    return { width: 120, height: 30 }
  }

  /**
   * Attempt to get terminal size using window size method
   *
   * Uses process.stdout.getWindowSize() to detect terminal dimensions.
   * Returns null if the method fails or returns invalid dimensions.
   *
   * @returns Terminal dimensions or null if detection fails
   */
  private tryGetWindowSize(): TerminalSize | null {
    try {
      if (globalThis.process.stdout.isTTY) {
        const [columns, rows] = globalThis.process.stdout.getWindowSize()
        if (columns && rows && columns > 0 && rows > 0) {
          return { width: columns, height: rows }
        }
      }
    } catch {
      // Silent fallback
    }
    return null
  }

  /**
   * Attempt to get terminal size using stdout properties
   *
   * Uses process.stdout.columns and process.stdout.rows to detect terminal dimensions.
   * Returns null if the properties are unavailable or invalid.
   *
   * @returns Terminal dimensions or null if detection fails
   */
  private tryGetStdoutSize(): TerminalSize | null {
    try {
      const { columns, rows } = globalThis.process.stdout
      if (columns && rows && columns > 0 && rows > 0) {
        return { width: columns, height: rows }
      }
    } catch {
      // Silent fallback
    }
    return null
  }

  /**
   * Attempt to get terminal size using environment variables
   *
   * Uses COLUMNS and LINES environment variables to detect terminal dimensions.
   * Returns null if the variables are unavailable or invalid.
   *
   * @returns Terminal dimensions or null if detection fails
   */
  private tryGetEnvSize(): TerminalSize | null {
    try {
      const envColumns = globalThis.process.env.COLUMNS ? parseInt(globalThis.process.env.COLUMNS) : null
      const envRows = globalThis.process.env.LINES ? parseInt(globalThis.process.env.LINES) : null
      if (envColumns && envRows && envColumns > 0 && envRows > 0) {
        return { width: envColumns, height: envRows }
      }
    } catch {
      // Silent fallback
    }
    return null
  }

  /**
   * Compute chart height based on volume pane
   *
   * Calculates the available chart height by subtracting margins and volume pane
   * height from the total terminal height. Ensures proper spacing for all chart components
   * and maintains minimum height requirements.
   *
   * @param volumePaneHeight - Height of the volume pane (0 if disabled)
   *
   * @example
   * ```typescript
   * chartData.computeHeight(6) // 6-line volume pane
   * console.log(`Chart height: ${chartData.height}`)
   * ```
   */
  computeHeight(volumePaneHeight: number): void {
    const volumePaneHeightActual = volumePaneHeight || 0
    const availableHeight = this.terminalSize.height - CONSTANTS.MARGIN_TOP - volumePaneHeightActual
    this.height = Math.max(availableHeight - 2, 10)
  }

  /**
   * Compute visible candles based on scaling mode and available width
   *
   * Determines which candles should be visible based on the current scaling mode
   * and available chart width. Supports dynamic scaling similar to TradingView.
   * Syncs with terminal resizing by using current terminal dimensions and updates
   * the visible candle set accordingly.
   *
   * @example
   * ```typescript
   * chartData.computeVisibleCandles()
   * console.log(`Visible candles: ${chartData.visibleCandleSet.candles.length}`)
   * ```
   */
  computeVisibleCandles(): void {
    const currentTerminalSize = this.getTerminalSize()
    const availableWidth = currentTerminalSize.width - CONSTANTS.WIDTH - this.margins.left - this.margins.right
    const allCandles = this.mainCandleSet.candles
    let visibleCandles = allCandles
    if (this.scalingMode === 'fixed' && this.timeRange) {
      const { start, end } = this.timeRange
      visibleCandles = allCandles.slice(start, end + 1)
    } else if (this.scalingMode === 'price' && this.priceRange) {
      const { min, max } = this.priceRange
      visibleCandles = allCandles.filter(candle => {
        const candleMin = Math.min(candle.open, candle.close)
        const candleMax = Math.max(candle.open, candle.close)
        return candleMin <= max && candleMax >= min
      })
    } else if (this.scalingMode === 'fit') {
      visibleCandles = this.sampleCandlesForWidth(allCandles, availableWidth)
    } else {
      visibleCandles = this.sampleCandlesForWidth(allCandles, availableWidth)
    }
    this.visibleCandleSet.setCandles(visibleCandles)
  }

  /**
   * Sample candles for width-constrained display
   *
   * Uses intelligent sampling to preserve data integrity while fitting
   * large datasets into limited display width. Each candle takes approximately
   * 2-3 characters, so we need to sample accordingly. Handles zoom in/out
   * properly and prevents bar cut-off while maintaining data accuracy.
   *
   * @param allCandles - Complete candle dataset
   * @param availableWidth - Available width for candle display
   * @returns Sampled candles optimized for display
   */
  private sampleCandlesForWidth(allCandles: Candles, availableWidth: number): Candles {
    const totalCandles = allCandles.length
    if (totalCandles === 0) {
      return []
    }
    const padding = 2
    const candleWidth = 1.1
    const maxCandles = Math.max(1, Math.floor((availableWidth - padding) / candleWidth))
    if (totalCandles <= maxCandles) {
      return allCandles
    }
    const startIndex = Math.max(0, totalCandles - maxCandles)
    return allCandles.slice(startIndex)
  }

  /**
   * Reset all candles
   *
   * Clears both main and visible candle sets, effectively resetting the chart data.
   * Useful when starting fresh or clearing old data. Maintains chart structure
   * and configuration while removing all candle data.
   *
   * @example
   * ```typescript
   * chartData.resetCandles()
   * // Chart is now empty
   * ```
   */
  resetCandles(): void {
    this.mainCandleSet.setCandles([])
    this.visibleCandleSet.setCandles([])
  }

  /**
   * Add candles to main set
   *
   * Appends new candles to the main candle set. The visible candle set is cleared
   * and will be recomputed on the next computeVisibleCandles() call. Maintains
   * data integrity and prepares for rendering updates.
   *
   * @param candles - Array of candles to add to the main set
   *
   * @example
   * ```typescript
   * chartData.addCandles(newCandles)
   * chartData.computeVisibleCandles() // Recompute visible candles
   * ```
   */
  addCandles(candles: Candles): void {
    this.mainCandleSet.addCandles(candles)
    this.visibleCandleSet.setCandles([])
  }

  /**
   * Set chart size
   *
   * Updates the chart dimensions and terminal size. This affects how many
   * candles can be displayed and the overall chart layout. Triggers recomputation
   * of visible candles and chart rendering parameters.
   *
   * @param width - New chart width in characters
   * @param height - New chart height in characters
   *
   * @example
   * ```typescript
   * chartData.setSize(120, 30)
   * chartData.computeVisibleCandles() // Recompute with new size
   * ```
   */
  setSize(width: number, height: number): void {
    this.terminalSize = { width, height }
    this.width = width
    this.height = height
  }

  /** Chart margins configuration */
  private margins = { top: 3, right: 4, bottom: 2, left: 0 }
  /** Current scaling mode */
  private scalingMode: 'fit' | 'fixed' | 'price' = 'fit'
  /** Time range for fixed scaling mode */
  private timeRange?: { start: number; end: number } | undefined
  /** Price range for price-based scaling mode */
  private priceRange?: { min: number; max: number } | undefined

  /**
   * Set chart margins
   *
   * Configures the chart margins to control spacing around the chart area.
   * These margins affect the available space for candle rendering and overall
   * chart layout. Triggers recomputation of visible candles.
   *
   * @param top - Top margin in characters
   * @param right - Right margin in characters
   * @param bottom - Bottom margin in characters
   * @param left - Left margin in characters
   *
   * @example
   * ```typescript
   * chartData.setMargins(3, 4, 2, 0) // Standard chart margins
   * ```
   */
  setMargins(top: number, right: number, bottom: number, left: number): void {
    this.margins = { top, right, bottom, left }
    this.computeVisibleCandles()
  }

  /**
   * Set chart scaling mode
   *
   * Configures how the chart handles candle visibility and scaling:
   * - 'fit': Shows all candles with compression if needed
   * - 'fixed': Shows a specific time range (requires setTimeRange)
   * - 'price': Shows candles within a specific price range (requires setPriceRange)
   * Triggers recomputation of visible candles based on the selected mode.
   *
   * @param mode - Scaling mode ('fit', 'fixed', or 'price')
   *
   * @example
   * ```typescript
   * chartData.setScalingMode('fit') // Show all candles
   * chartData.setScalingMode('fixed') // Show specific time range
   * chartData.setScalingMode('price') // Show specific price range
   * ```
   */
  setScalingMode(mode: 'fit' | 'fixed' | 'price'): void {
    this.scalingMode = mode
    this.computeVisibleCandles()
  }

  /**
   * Set price range for price-based scaling
   *
   * Configures a specific price range to display when using 'price' scaling mode.
   * Only candles that overlap with the specified price range will be visible.
   * Triggers recomputation of visible candles based on the price range.
   *
   * @param minPrice - Minimum price to show (inclusive)
   * @param maxPrice - Maximum price to show (inclusive)
   * @throws Error if minPrice >= maxPrice
   *
   * @example
   * ```typescript
   * chartData.setScalingMode('price')
   * chartData.setPriceRange(100, 200) // Show candles between $100-$200
   * ```
   */
  setPriceRange(minPrice: number, maxPrice: number): void {
    if (minPrice >= maxPrice) {
      throw new Error('Minimum price must be less than maximum price')
    }
    this.priceRange = { min: minPrice, max: maxPrice }
    this.computeVisibleCandles()
  }

  /**
   * Set time range for fixed scaling mode
   *
   * Configures a specific time range to display when using 'fixed' scaling mode.
   * Only candles within the specified index range will be visible.
   * Triggers recomputation of visible candles based on the time range.
   *
   * @param startIndex - Starting candle index (inclusive)
   * @param endIndex - Ending candle index (inclusive)
   * @throws Error if startIndex >= endIndex or indices are invalid
   *
   * @example
   * ```typescript
   * chartData.setScalingMode('fixed')
   * chartData.setTimeRange(0, 99) // Show first 100 candles
   * ```
   */
  setTimeRange(startIndex: number, endIndex: number): void {
    if (startIndex >= endIndex) {
      throw new Error('Start index must be less than end index')
    }
    if (startIndex < 0 || endIndex < 0) {
      throw new Error('Indices must be non-negative')
    }
    this.timeRange = { start: startIndex, end: endIndex }
    this.computeVisibleCandles()
  }

  /**
   * Fit chart to all available data
   *
   * Resets scaling mode to 'fit' and recomputes visible candles to show all data.
   * Useful for resetting the chart view to display the complete dataset
   * with optimal scaling and visibility.
   *
   * @example
   * ```typescript
   * chartData.fitToData() // Show all available candles
   * ```
   */
  fitToData(): void {
    this.scalingMode = 'fit'
    this.timeRange = undefined
    this.priceRange = undefined
    this.computeVisibleCandles()
  }
}
