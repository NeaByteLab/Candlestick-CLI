import { ChartData } from '@/chart/chart-data'
import { ChartRenderer } from '@/chart/chart-renderer'
import { InfoBar } from '@/chart/info-bar'
import { VolumePane } from '@/chart/volume-pane'
import { YAxis } from '@/chart/y-axis'
import { ChartRenderError, ConfigurationError } from '@/types/errors'
import {
  validateCandles,
  validateRGBColor,
  validateChartDimensions,
  validateMargins,
  validateTimeRange
} from '@/utils/validation'
import type { Candles, ChartHighlights, ColorValue } from '@/types/candlestick'

const UNKNOWN_ERROR = 'Unknown error'

/**
 * Main Chart class for rendering candlestick charts
 *
 * Provides a comprehensive interface for creating, configuring, and rendering
 * ASCII art candlestick charts. Supports real-time data updates, custom styling,
 * and interactive features like price highlighting and auto-resizing.
 * Implements complete chart lifecycle management and error handling.
 *
 * @example
 * ```typescript
 * import { Chart } from '@/chart/chart'
 *
 * const chart = new Chart(candles, { title: 'BTC/USDT', width: 120, height: 30 })
 * chart.setBearColor(255, 0, 0)    // Custom red for bearish candles
 * chart.setBullColor(0, 255, 0)    // Custom green for bullish candles
 * chart.draw()                      // Render to console
 * ```
 */
export class Chart {
  /** Chart data management instance */
  chartData: ChartData
  /** Information bar for displaying statistics */
  infoBar: InfoBar
  /** Chart rendering engine */
  renderer: ChartRenderer
  /** Price highlights for Y-axis */
  highlights: ChartHighlights = {}
  /** Volume pane for volume visualization */
  volumePane: VolumePane
  /** Y-axis for price labels and scaling */
  yAxis: YAxis

  /**
   * Initialize Chart with candles and options
   *
   * Creates a new Chart instance with comprehensive validation and setup.
   * Initializes all chart components including data management, rendering,
   * and display components. Handles configuration errors gracefully.
   *
   * @param candles - Array of candle data to display
   * @param options - Chart configuration options
   * @throws ChartRenderError if initialization fails
   * @throws ConfigurationError if options are invalid
   *
   * @example
   * ```typescript
   * const chart = new Chart(candles, { title: 'BTC/USDT', width: 120, height: 30 })
   * ```
   */
  constructor(
    candles: Candles,
    options: {
      title?: string
      width?: number
      height?: number
      rendererClass?: typeof ChartRenderer
    } = {}
  ) {
    try {
      validateCandles(candles)
      const { title = 'My chart', width = 0, height = 0, rendererClass = ChartRenderer } = options
      validateChartDimensions(width, height)
      if (title && typeof title !== 'string') {
        throw new ConfigurationError('Chart title must be a string', 'title')
      }
      this.renderer = new rendererClass()
      this.chartData = new ChartData(candles, { width, height })
      this.yAxis = new YAxis(this.chartData)
      this.infoBar = new InfoBar(title)
      this.volumePane = new VolumePane(Math.floor(this.chartData.height / 6))
    } catch (error) {
      if (error instanceof ChartRenderError || error instanceof ConfigurationError) {
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ChartRenderError(`Failed to initialize chart: ${errorMessage}`)
    }
  }

  /**
   * Get the full chart as a single string
   *
   * Renders the complete chart to a string representation ready for output.
   * This is the core rendering method that orchestrates all chart components.
   *
   * @returns Complete chart string with all components rendered
   *
   * @example
   * ```typescript
   * const chartString = chart.render()
   * // Use chartString for output or further processing
   * ```
   */
  private render(): string {
    return this.renderer.render(this)
  }

  /**
   * Draw the chart to console
   *
   * Renders the complete chart and outputs it to the console using console.log.
   * This is the primary method for displaying charts in terminal environments.
   *
   * @throws ChartRenderError if rendering fails
   *
   * @example
   * ```typescript
   * chart.draw() // Outputs chart to console
   * ```
   */
  draw(): void {
    try {
      const chartString = this.render()
      globalThis.console.log(chartString)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ChartRenderError(`Failed to draw chart: ${errorMessage}`)
    }
  }

  /**
   * Set bearish candle color
   *
   * Configures the RGB color for bearish (downward) candles. Uses truecolor
   * ANSI escape sequences for precise color control across different terminals.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @throws ConfigurationError if color values are invalid
   *
   * @example
   * ```typescript
   * chart.setBearColor(255, 0, 0) // Bright red for bearish candles
   * ```
   */
  setBearColor(r: number, g: number, b: number): void {
    try {
      validateRGBColor(r, g, b)
      this.renderer.bearishColor = [r, g, b]
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ConfigurationError(`Invalid bear color: ${errorMessage}`, 'bearColor')
    }
  }

  /**
   * Set bullish candle color
   *
   * Configures the RGB color for bullish (upward) candles. Uses truecolor
   * ANSI escape sequences for precise color control across different terminals.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @throws ConfigurationError if color values are invalid
   *
   * @example
   * ```typescript
   * chart.setBullColor(0, 255, 0) // Bright green for bullish candles
   * ```
   */
  setBullColor(r: number, g: number, b: number): void {
    try {
      validateRGBColor(r, g, b)
      this.renderer.bullishColor = [r, g, b]
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ConfigurationError(`Invalid bull color: ${errorMessage}`, 'bullColor')
    }
  }

  /**
   * Set info bar label
   *
   * Configures custom labels for the information bar display. Allows
   * customization of the statistics shown in the chart footer.
   *
   * @param label - Label name to configure
   * @param value - Label value (empty string to hide)
   *
   * @example
   * ```typescript
   * chart.setLabel('custom', 'Custom Value')
   * chart.setLabel('volume', '') // Hide volume label
   * ```
   */
  setLabel(label: string, value: string): void {
    ;(this.infoBar.labels as unknown as Record<string, string>)[label] = value
  }

  /**
   * Set highlight for specific price
   *
   * Configures price highlighting on the Y-axis for specific price levels.
   * Useful for highlighting support/resistance levels or important price points.
   *
   * @param price - Price string to highlight
   * @param color - Color value (name, RGB, or ANSI code)
   *
   * @example
   * ```typescript
   * chart.setHighlight('100.50', 'red')
   * chart.setHighlight('200.00', [255, 255, 0]) // Yellow highlight
   * ```
   */
  setHighlight(price: string, color: ColorValue): void {
    if (color) {
      this.highlights[price] = color
    } else {
      delete this.highlights[price]
    }
  }

  /**
   * Set chart name
   *
   * Updates the chart name displayed in the information bar. This is
   * typically the trading pair or chart title.
   *
   * @param name - Chart name to display
   *
   * @example
   * ```typescript
   * chart.setName('BTC/USDT 4H Chart')
   * ```
   */
  setName(name: string): void {
    this.infoBar.name = name
  }

  /**
   * Set volume bearish color
   *
   * Configures the RGB color for bearish volume bars in the volume pane.
   * Separate from main candle colors for volume-specific styling.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   *
   * @example
   * ```typescript
   * chart.setVolBearColor(255, 100, 100) // Light red for bearish volume
   * ```
   */
  setVolBearColor(r: number, g: number, b: number): void {
    this.volumePane.bearishColor = [r, g, b]
  }

  /**
   * Set volume bullish color
   *
   * Configures the RGB color for bullish volume bars in the volume pane.
   * Separate from main candle colors for volume-specific styling.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   *
   * @example
   * ```typescript
   * chart.setVolBullColor(100, 255, 100) // Light green for bullish volume
   * ```
   */
  setVolBullColor(r: number, g: number, b: number): void {
    this.volumePane.bullishColor = [r, g, b]
  }

  /**
   * Enable or disable volume pane
   *
   * Controls the visibility of the volume pane below the main chart.
   * When disabled, only the main chart and info bar are displayed.
   *
   * @param enabled - Whether to enable volume pane
   *
   * @example
   * ```typescript
   * chart.setVolumePaneEnabled(false) // Hide volume pane
   * ```
   */
  setVolumePaneEnabled(enabled: boolean): void {
    this.volumePane.enabled = enabled
  }

  /**
   * Set volume pane height
   *
   * Configures the height of the volume pane in lines. Affects the
   * overall chart layout and available space for volume visualization.
   *
   * @param height - Volume pane height in lines
   *
   * @example
   * ```typescript
   * chart.setVolumePaneHeight(8) // 8-line volume pane
   * ```
   */
  setVolumePaneHeight(height: number): void {
    this.volumePane.height = height
  }

  /**
   * Set volume pane unicode fill character
   *
   * Configures the Unicode character used to fill volume bars in the volume pane.
   * Allows customization of the volume bar appearance.
   *
   * @param unicodeFill - Unicode character for volume bars
   *
   * @example
   * ```typescript
   * chart.setVolumePaneUnicodeFill('█') // Solid block for volume bars
   * ```
   */
  setVolumePaneUnicodeFill(unicodeFill: string): void {
    this.volumePane.unicodeFill = unicodeFill
  }

  /**
   * Update candles in the chart
   *
   * Adds new candles to the chart or replaces existing ones. Supports
   * both incremental updates and complete data replacement.
   *
   * @param candles - New candles to add or replace
   * @param reset - Whether to reset existing candles (default: false)
   *
   * @example
   * ```typescript
   * chart.updateCandles(newCandles) // Add to existing
   * chart.updateCandles(newCandles, true) // Replace all
   * ```
   */
  updateCandles(candles: Candles, reset: boolean = false): void {
    if (reset) {
      this.chartData.resetCandles()
    }
    this.chartData.addCandles(candles)
    this.chartData.computeVisibleCandles()
  }

  /**
   * Update chart size
   *
   * Updates the chart dimensions and triggers recomputation of visible candles.
   * Only updates if the new dimensions are different from current ones.
   *
   * @param width - New chart width
   * @param height - New chart height
   *
   * @example
   * ```typescript
   * chart.updateSize(140, 40) // Larger chart
   * ```
   */
  updateSize(width: number, height: number): void {
    if (width === this.chartData.terminalSize.width && height === this.chartData.terminalSize.height) {
      return
    }
    this.chartData.setSize(width, height)
    this.chartData.computeVisibleCandles()
    if (this.volumePane.enabled) {
      this.setVolumePaneHeight(Math.floor(this.chartData.height / 6))
    }
  }

  /**
   * Update size from current terminal dimensions
   *
   * Automatically updates chart size based on current terminal dimensions.
   * Useful for responsive charts that adapt to terminal resizing.
   *
   * @example
   * ```typescript
   * chart.updateSizeFromTerminal() // Adapt to current terminal size
   * ```
   */
  updateSizeFromTerminal(): void {
    const terminalSize = this.chartData.getTerminalSize()
    this.updateSize(terminalSize.width, terminalSize.height)
  }

  /**
   * Enable automatic terminal size following
   *
   * Configures the chart to automatically resize when the terminal dimensions change.
   * Implements both event-based and interval-based resizing for maximum compatibility.
   *
   * @param interval - Check interval in milliseconds (default: 1000ms)
   *
   * @example
   * ```typescript
   * chart.enableAutoResize(500) // Check every 500ms
   * ```
   */
  enableAutoResize(interval: number = 1000): void {
    if (typeof globalThis.process === 'undefined' || !globalThis.process.stdout) {
      globalThis.console.warn('Auto-resize not available in this environment')
      return
    }
    const resizeHandler = (): void => {
      this.updateSizeFromTerminal()
    }
    if (globalThis.process.stdout.on) {
      globalThis.process.stdout.on('resize', resizeHandler)
    }
    const intervalId = globalThis.setInterval(() => {
      this.updateSizeFromTerminal()
    }, interval)
    this._cleanupAutoResize = (): void => {
      if (globalThis.process.stdout.off) {
        globalThis.process.stdout.off('resize', resizeHandler)
      }
      globalThis.clearInterval(intervalId)
    }
  }

  /**
   * Disable automatic terminal size following
   *
   * Stops automatic resizing and cleans up event listeners and intervals.
   * Should be called when auto-resize is no longer needed.
   *
   * @example
   * ```typescript
   * chart.disableAutoResize() // Stop auto-resizing
   * ```
   */
  disableAutoResize(): void {
    if (this._cleanupAutoResize) {
      this._cleanupAutoResize()
      this._cleanupAutoResize = undefined
    }
  }

  /**
   * Set chart margins
   *
   * Configures the chart margins to control spacing around the chart area.
   * Validates margin values and applies them to the chart data.
   *
   * @param top - Top margin (default: 3)
   * @param right - Right margin (default: 4)
   * @param bottom - Bottom margin (default: 2)
   * @param left - Left margin (default: 0)
   * @throws ConfigurationError if margin values are invalid
   *
   * @example
   * ```typescript
   * chart.setMargins(5, 6, 3, 1) // Custom margins
   * ```
   */
  setMargins(top: number = 3, right: number = 4, bottom: number = 2, left: number = 0): void {
    try {
      validateMargins(top, right, bottom, left)
      this.chartData.setMargins(top, right, bottom, left)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ConfigurationError(`Invalid margins: ${errorMessage}`, 'margins')
    }
  }

  /**
   * Set chart scaling mode
   *
   * Configures how the chart handles candle visibility and scaling.
   * Different modes provide different ways to view the data.
   *
   * @param mode - 'fit' (fit all data), 'fixed' (fixed time scale), or 'price' (price-based scale)
   *
   * @example
   * ```typescript
   * chart.setScalingMode('fit') // Show all data
   * chart.setScalingMode('fixed') // Show specific time range
   * chart.setScalingMode('price') // Show specific price range
   * ```
   */
  setScalingMode(mode: 'fit' | 'fixed' | 'price'): void {
    this.chartData.setScalingMode(mode)
  }

  /**
   * Set price range for price-based scaling
   *
   * Configures a specific price range to display when using 'price' scaling mode.
   * Only candles within the specified price range will be visible.
   *
   * @param minPrice - Minimum price to show (inclusive)
   * @param maxPrice - Maximum price to show (inclusive)
   * @throws Error if minPrice >= maxPrice
   *
   * @example
   * ```typescript
   * chart.setPriceRange(100, 200) // Show candles between $100-$200
   * ```
   */
  setPriceRange(minPrice: number, maxPrice: number): void {
    this.chartData.setPriceRange(minPrice, maxPrice)
  }

  /**
   * Set time range for fixed scaling
   *
   * Configures a specific time range to display when using 'fixed' scaling mode.
   * Only candles within the specified index range will be visible.
   *
   * @param startIndex - Start candle index
   * @param endIndex - End candle index
   * @throws ConfigurationError if time range is invalid
   *
   * @example
   * ```typescript
   * chart.setTimeRange(0, 99) // Show first 100 candles
   * ```
   */
  setTimeRange(startIndex: number, endIndex: number): void {
    try {
      const maxLength = this.chartData.mainCandleSet.candles.length
      validateTimeRange(startIndex, endIndex, maxLength)
      this.chartData.setTimeRange(startIndex, endIndex)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ConfigurationError(`Invalid time range: ${errorMessage}`, 'timeRange')
    }
  }

  /**
   * Auto-fit chart to show all data with proper margins
   *
   * Resets the chart to 'fit' mode and clears any time range or price range restrictions.
   * This ensures all available data is displayed with proper scaling.
   *
   * @example
   * ```typescript
   * chart.fitToData() // Show all data with fit scaling
   * ```
   */
  fitToData(): void {
    this.chartData.fitToData()
  }

  /**
   * Cleanup function for auto-resize
   *
   * Internal cleanup function used by the auto-resize feature to remove
   * event listeners and intervals when auto-resize is disabled.
   */
  private _cleanupAutoResize?: (() => void) | undefined
}
