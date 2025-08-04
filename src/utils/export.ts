import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { extname, dirname } from 'path'
import { Chart } from '@/chart/chart'
import { ConfigurationError } from '@/types/errors'
import type { ExportOptions } from '@/types/candlestick'
import type { Candles } from '@/types/candlestick'
import { CONSTANTS } from '@/constants'

// Import the constant from chart module
const UNKNOWN_ERROR = 'Unknown error'

/**
 * Export chart to text file
 *
 * Converts chart content to a plain text file with optional ANSI color code preservation.
 * Creates output directories automatically and handles file system errors with proper
 * error messages. Supports both colored and plain text output formats.
 *
 * @param chart - Chart instance containing data to export
 * @param outputPath - Target file path for text output
 * @param preserveColors - Preserve ANSI color codes in output (default: false)
 * @throws ConfigurationError when file writing fails or path is invalid
 *
 * @example
 * ```typescript
 * import { exportToText } from '@/utils/export'
 *
 * exportToText(chart, 'chart.txt')
 * exportToText(chart, 'chart.txt', true) // Preserve colors
 * ```
 */
export async function exportToText(chart: Chart, outputPath: string, preserveColors: boolean = false): Promise<void> {
  validateOutputPath(outputPath)
  ensureDirectoryExists(outputPath)
  const content = await chart.render()
  const finalContent = preserveColors ? content : stripAnsiCodes(content)
  try {
    writeFileSync(outputPath, finalContent, 'utf8')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
    throw new ConfigurationError(`Failed to write text file: ${errorMessage}`, 'outputPath')
  }
}

/**
 * Export chart to image file
 *
 * Renders chart data as a PNG image with configurable dimensions, themes, and scaling.
 * Uses HTML5 Canvas API for pixel-perfect rendering with support for custom colors,
 * backgrounds, and volume pane visualization. Handles chart scaling and positioning
 * automatically based on data characteristics.
 *
 * @param chart - Chart instance containing data to render
 * @param options - Export configuration with path, theme, and scaling options
 * @throws ConfigurationError when rendering fails or options are invalid
 *
 * @example
 * ```typescript
 * import { exportToImage } from '@/utils/export'
 *
 * await exportToImage(chart, {
 *   outputPath: 'chart.png',
 *   background: 'dark',
 *   scale: 2
 * })
 * ```
 */
export async function exportToImage(chart: Chart, options: ExportOptions): Promise<void> {
  validateExportOptions(options)
  ensureDirectoryExists(options.outputPath)
  const allCandles = chart.chartData.mainCandleSet.candles
  const exportChart = new Chart(allCandles, {
    title: chart.infoBar.name || 'Live Chart'
  })
  exportChart.setBearColor(...chart.renderer.bearishColor)
  exportChart.setBullColor(...chart.renderer.bullishColor)
  exportChart.setVolumePaneEnabled(chart.volumePane.enabled)
  exportChart.setVolumePaneHeight(chart.volumePane.height)
  if (chart.volumePane.enabled) {
    exportChart.setVolBearColor(...chart.volumePane.bearishColor)
    exportChart.setVolBullColor(...chart.volumePane.bullishColor)
  }
  exportChart.setMargins(2, 2, 1, 0)
  exportChart.setScalingMode('fit')
  exportChart.fitToData()
  await renderChartToCanvas(exportChart, options)
}

/**
 * Validate export options
 *
 * Performs comprehensive validation of export configuration parameters.
 * Verifies required fields are present and validates parameter types and values.
 * Ensures export operations have all necessary configuration data.
 *
 * @param options - Export configuration object to validate
 * @throws ConfigurationError when required options are missing or invalid
 *
 * @example
 * ```typescript
 * validateExportOptions({ outputPath: 'chart.png' })
 * ```
 */
function validateExportOptions(options: ExportOptions): void {
  if (!options.outputPath) {
    throw new ConfigurationError('Output path is required for export', 'outputPath')
  }
}

/**
 * Validate output file path
 *
 * Verifies file path format and supported extension types for export operations.
 * Validates path structure and ensures compatibility with export functions.
 * Supports text (.txt) and image (.png) export formats.
 *
 * @param outputPath - Target file path to validate
 * @throws ConfigurationError when path format is invalid or extension unsupported
 *
 * @example
 * ```typescript
 * validateOutputPath('chart.png') // Valid
 * validateOutputPath('chart.txt') // Valid
 * validateOutputPath('chart.pdf') // Invalid
 * ```
 */
function validateOutputPath(outputPath: string): void {
  const validExtensions = ['.txt', '.png']
  const ext = extname(outputPath).toLowerCase()
  if (!validExtensions.includes(ext)) {
    throw new ConfigurationError(`Unsupported file extension: ${ext}. Use .txt or .png`, 'outputPath')
  }
}

/**
 * Ensure directory exists for file path
 *
 * Creates parent directories for target file paths when they don't exist.
 * Handles nested directory structures and file system permission errors.
 * Ensures export operations can write to specified locations.
 *
 * @param filePath - Target file path requiring directory creation
 * @throws ConfigurationError when directory creation fails due to permissions or path issues
 *
 * @example
 * ```typescript
 * ensureDirectoryExists('/path/to/file.txt')
 * // Creates /path/to/ directory if it doesn't exist
 * ```
 */
function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR
      throw new ConfigurationError(`Failed to create directory: ${errorMessage}`, 'outputPath')
    }
  }
}

/**
 * Strip ANSI color codes from text
 *
 * Removes ANSI escape sequences from text while preserving actual content.
 * Used for text length calculations and plain text export operations.
 * Handles all standard ANSI color and formatting codes.
 *
 * @param content - Text containing ANSI escape sequences
 * @returns Clean text content without ANSI codes
 *
 * @example
 * ```typescript
 * const plainText = stripAnsiCodes('\x1b[32mHello\x1b[0m')
 * // Returns: "Hello"
 * ```
 */
function stripAnsiCodes(content: string): string {
  return content.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Render chart directly to canvas with proper candle drawing
 *
 * Converts chart data to canvas graphics using native drawing operations.
 * Renders candlestick bodies and wicks as geometric shapes rather than
 * text characters for optimal image quality and scalability.
 *
 * @param chart - Chart instance containing data to render
 * @param options - Export configuration with scale and theme settings
 * @throws ConfigurationError when rendering fails or chart data is empty
 */
async function renderChartToCanvas(chart: Chart, options: ExportOptions): Promise<void> {
  const { createCanvas } = await import('canvas')
  const { writeFileSync } = await import('fs')
  const theme = options.background || 'dark'
  const backgroundColor = theme === 'light' ? '#ffffff' : '#000000'
  const scale = options.scale || 1
  const { candles } = chart.chartData.visibleCandleSet
  if (candles.length === 0) {
    throw new ConfigurationError('No candles to render', 'chart')
  }
  const { maxPrice, priceRange } = calculatePriceRange(candles)
  const { finalWidth, finalHeight, actualScale } = calculateCanvasDimensions(scale, chart)
  const { chartAreaX, chartAreaY, chartAreaWidthScaled, chartAreaHeightScaled } = calculateChartArea(actualScale, chart)
  const { candleWidth, candleSpacing } = calculateCandleDimensions(chartAreaWidthScaled, candles.length)
  const canvas = createCanvas(finalWidth, finalHeight)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, finalWidth, finalHeight)
  drawPriceLabels(ctx, maxPrice, priceRange, chartAreaY, chartAreaHeightScaled, actualScale, theme)
  drawCandles(
    ctx,
    candles,
    chart,
    chartAreaX,
    chartAreaY,
    chartAreaHeightScaled,
    candleWidth,
    candleSpacing,
    maxPrice,
    priceRange
  )
  if (chart.volumePane.enabled) {
    const volumeAreaY = chartAreaY + chartAreaHeightScaled + 20
    const volumeAreaHeight = chart.volumePane.height * 16 * scale
    drawVolumePane(
      ctx,
      candles,
      chart,
      chartAreaX,
      volumeAreaY,
      chartAreaWidthScaled,
      volumeAreaHeight,
      candleWidth,
      candleSpacing
    )
  }
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(options.outputPath, buffer)
}

/**
 * Calculate price range from candles
 *
 * Analyzes candle dataset to determine price boundaries for chart scaling.
 * Extracts minimum and maximum prices to establish Y-axis range for
 * proper chart rendering and label positioning.
 *
 * @param candles - Array of candle data to analyze
 * @returns Object containing maximum price value and total price range
 *
 * @example
 * ```typescript
 * const { maxPrice, priceRange } = calculatePriceRange(candles)
 * console.log(`Price range: ${priceRange}, Max: ${maxPrice}`)
 * ```
 */
function calculatePriceRange(candles: Candles): { maxPrice: number; priceRange: number } {
  const prices = candles.flatMap(({ high, low }) => [high, low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  return { maxPrice, priceRange }
}

/**
 * Calculate canvas dimensions with scaling
 *
 * Determines optimal canvas size based on scale factor and chart characteristics.
 * Applies size constraints and minimum dimensions for readability.
 * Maintains aspect ratio while preventing oversized output images.
 *
 * @param scale - Requested scale factor for image export
 * @param chart - Chart instance with volume pane and dimension settings
 * @returns Object containing final canvas dimensions and applied scale factor
 *
 * @example
 * ```typescript
 * const { finalWidth, finalHeight, actualScale } = calculateCanvasDimensions(2, chart)
 * console.log(`Canvas: ${finalWidth}x${finalHeight}, Scale: ${actualScale}`)
 * ```
 */
function calculateCanvasDimensions(
  scale: number,
  chart: Chart
): { finalWidth: number; finalHeight: number; actualScale: number } {
  const padding = 40
  const asciiWidth = chart.chartData.width || 120
  const asciiHeight = chart.chartData.height || 30
  const charWidth = 8
  const charHeight = 16
  const chartAreaWidth = asciiWidth * charWidth * scale
  const chartAreaHeight = asciiHeight * charHeight * scale
  const volumeHeight = chart.volumePane.enabled ? chart.volumePane.height * charHeight * scale : 0
  const width = chartAreaWidth + padding * 2 + 120
  const height = chartAreaHeight + volumeHeight + padding * 2 + 60
  const MAX_CANVAS_SIZE = 16384
  const MAX_DIMENSION = Math.min(MAX_CANVAS_SIZE, 3000)
  let finalWidth = width
  let finalHeight = height
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scaleFactor = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    finalWidth = Math.floor(width * scaleFactor)
    finalHeight = Math.floor(height * scaleFactor)
  }
  finalWidth = Math.max(finalWidth, 400)
  finalHeight = Math.max(finalHeight, 300)
  const scaleX = finalWidth / width
  const scaleY = finalHeight / height
  const actualScale = Math.min(scaleX, scaleY)
  return { finalWidth, finalHeight, actualScale }
}

/**
 * Calculate chart area dimensions
 *
 * Determines chart area positioning and dimensions within the canvas space.
 * Calculates scaled coordinates for chart rendering with proper margins
 * and padding. Used for accurate positioning of chart elements.
 *
 * @param actualScale - Applied scale factor for canvas rendering
 * @param chart - Chart instance with dimension and margin settings
 * @returns Object containing chart area coordinates and scaled dimensions
 *
 * @example
 * ```typescript
 * const { chartAreaX, chartAreaY, chartAreaWidthScaled, chartAreaHeightScaled } = calculateChartArea(1.5, chart)
 * console.log(`Chart area: ${chartAreaWidthScaled}x${chartAreaHeightScaled} at (${chartAreaX}, ${chartAreaY})`)
 * ```
 */
function calculateChartArea(
  actualScale: number,
  chart: Chart
): {
  chartAreaX: number
  chartAreaY: number
  chartAreaWidthScaled: number
  chartAreaHeightScaled: number
} {
  const padding = 40
  const asciiWidth = chart.chartData.width || 120
  const asciiHeight = chart.chartData.height || 30
  const charWidth = 8
  const charHeight = 16
  const chartAreaWidth = asciiWidth * charWidth
  const chartAreaHeight = asciiHeight * charHeight
  const chartAreaX = (padding + 120) * actualScale
  const chartAreaY = (padding + 20) * actualScale
  const chartAreaWidthScaled = chartAreaWidth * actualScale
  const chartAreaHeightScaled = chartAreaHeight * actualScale
  return { chartAreaX, chartAreaY, chartAreaWidthScaled, chartAreaHeightScaled }
}

/**
 * Calculate candle dimensions for rendering
 *
 * Determines optimal candle width and spacing based on chart area and data count.
 * Ensures candles remain visible and properly spaced for clear visualization.
 * Balances candle size with spacing for optimal chart readability.
 *
 * @param chartAreaWidthScaled - Available chart area width in pixels
 * @param candleCount - Total number of candles to display
 * @returns Object containing calculated candle width and spacing values
 *
 * @example
 * ```typescript
 * const { candleWidth, candleSpacing } = calculateCandleDimensions(800, 100)
 * console.log(`Candle width: ${candleWidth}, Spacing: ${candleSpacing}`)
 * ```
 */
function calculateCandleDimensions(
  chartAreaWidthScaled: number,
  candleCount: number
): { candleWidth: number; candleSpacing: number } {
  const candleWidth = Math.max(3, (chartAreaWidthScaled / candleCount) * 0.95)
  const candleSpacing = chartAreaWidthScaled / candleCount
  return { candleWidth, candleSpacing }
}

/**
 * Draw price labels on canvas Y-axis
 *
 * Renders price labels along the Y-axis with proper positioning and formatting.
 * Creates evenly spaced price graduations with theme-appropriate colors
 * and scaled font sizes for readability in exported images.
 *
 * @param ctx - Canvas rendering context for drawing operations
 * @param maxPrice - Maximum price value for Y-axis scaling
 * @param priceRange - Total price range for label positioning
 * @param chartAreaY - Y-coordinate of chart area top
 * @param chartAreaHeightScaled - Height of chart area in pixels
 * @param actualScale - Scale factor for font and positioning
 * @param theme - Color theme ('light' or 'dark') for label colors
 *
 * @example
 * ```typescript
 * drawPriceLabels(ctx, 50000, 5000, 100, 400, 1.5, 'dark')
 * // Draws price labels on dark theme with 1.5x scale
 * ```
 */
function drawPriceLabels(
  ctx: {
    fillStyle: string | CanvasGradient | CanvasPattern
    font: string
    fillText: (text: string, x: number, y: number) => void
  },
  maxPrice: number,
  priceRange: number,
  chartAreaY: number,
  chartAreaHeightScaled: number,
  actualScale: number,
  theme: string
): void {
  const minPrice = maxPrice - priceRange
  const chartHeight = Math.round(chartAreaHeightScaled / (16 * actualScale))
  for (let i = 1; i <= chartHeight; i++) {
    let price: number
    if (i === chartHeight) {
      price = maxPrice
    } else if (i === 1) {
      price = minPrice
    } else {
      price = minPrice + ((i - 1) * priceRange) / (chartHeight - 1)
    }
    const y = chartAreaY + ((maxPrice - price) / priceRange) * chartAreaHeightScaled
    ctx.fillStyle = theme === 'light' ? '#666666' : '#999999'
    ctx.font = `${16 * actualScale}px monospace`
    ctx.fillText(price.toFixed(CONSTANTS.DEC_PRECISION), 40 * actualScale, y - 10 * actualScale)
  }
}

/**
 * Draw candles on canvas with proper styling
 *
 * Renders candlestick chart elements including wicks and bodies with
 * appropriate colors based on bullish/bearish movement. Handles proper
 * positioning, scaling, and color application for high-quality image export.
 *
 * @param ctx - Canvas rendering context with drawing methods
 * @param candles - Array of candle data to render
 * @param chart - Chart instance for color configuration
 * @param chartAreaX - X-coordinate of chart area left edge
 * @param chartAreaY - Y-coordinate of chart area top edge
 * @param chartAreaHeightScaled - Height of chart area in pixels
 * @param candleWidth - Width of each candle in pixels
 * @param candleSpacing - Spacing between candles in pixels
 * @param maxPrice - Maximum price for Y-axis scaling
 * @param priceRange - Total price range for positioning
 *
 * @example
 * ```typescript
 * drawCandles(ctx, candles, chart, 100, 50, 400, 8, 12, 50000, 5000)
 * ```
 */
function drawCandles(
  ctx: {
    strokeStyle: string | CanvasGradient | CanvasPattern
    lineWidth: number
    beginPath: () => void
    moveTo: (x: number, y: number) => void
    lineTo: (x: number, y: number) => void
    stroke: () => void
    fillStyle: string | CanvasGradient | CanvasPattern
    fillRect: (x: number, y: number, width: number, height: number) => void
  },
  candles: Candles,
  chart: Chart,
  chartAreaX: number,
  chartAreaY: number,
  chartAreaHeightScaled: number,
  candleWidth: number,
  candleSpacing: number,
  maxPrice: number,
  priceRange: number
): void {
  candles.forEach((candle, index) => {
    const x = chartAreaX + index * candleSpacing + (candleSpacing - candleWidth) / 2
    const highY = chartAreaY + ((maxPrice - candle.high) / priceRange) * chartAreaHeightScaled
    const lowY = chartAreaY + ((maxPrice - candle.low) / priceRange) * chartAreaHeightScaled
    const openY = chartAreaY + ((maxPrice - candle.open) / priceRange) * chartAreaHeightScaled
    const closeY = chartAreaY + ((maxPrice - candle.close) / priceRange) * chartAreaHeightScaled
    const isBullish = candle.close > candle.open
    const candleColor = isBullish
      ? `rgb(${chart.renderer.bullishColor[0]}, ${chart.renderer.bullishColor[1]}, ${chart.renderer.bullishColor[2]})`
      : `rgb(${chart.renderer.bearishColor[0]}, ${chart.renderer.bearishColor[1]}, ${chart.renderer.bearishColor[2]})`
    ctx.strokeStyle = candleColor
    ctx.lineWidth = Math.max(1, 1)
    ctx.beginPath()
    ctx.moveTo(x + candleWidth / 2, highY)
    ctx.lineTo(x + candleWidth / 2, lowY)
    ctx.stroke()
    const bodyTop = Math.min(openY, closeY)
    const bodyHeight = Math.abs(closeY - openY)
    const bodyHeightMin = Math.max(2, 1)
    ctx.fillStyle = candleColor
    ctx.fillRect(x, bodyTop, candleWidth, Math.max(bodyHeight, bodyHeightMin))
  })
}

/**
 * Draw volume pane on canvas
 *
 * Renders volume bars below the main chart with proper scaling and colors.
 * Uses bullish/bearish colors based on candle direction and scales volume
 * to fit the available height.
 *
 * @param ctx - Canvas rendering context
 * @param candles - Array of candle data
 * @param chart - Chart instance for color configuration
 * @param volumeAreaX - X-coordinate of volume area
 * @param volumeAreaY - Y-coordinate of volume area
 * @param volumeAreaWidth - Width of volume area
 * @param volumeAreaHeight - Height of volume area
 * @param candleWidth - Width of each candle
 * @param candleSpacing - Spacing between candles
 *
 * @example
 * ```typescript
 * drawVolumePane(ctx, candles, chart, 100, 500, 800, 100, 8, 12)
 * ```
 */
function drawVolumePane(
  ctx: {
    fillStyle: string | CanvasGradient | CanvasPattern
    fillRect: (x: number, y: number, width: number, height: number) => void
  },
  candles: Candles,
  chart: Chart,
  volumeAreaX: number,
  volumeAreaY: number,
  _volumeAreaWidth: number,
  volumeAreaHeight: number,
  candleWidth: number,
  candleSpacing: number
): void {
  const maxVolume = Math.max(...candles.map(c => c.volume || 0))
  candles.forEach((candle, index) => {
    if (!candle.volume) {
      return
    }
    const x = volumeAreaX + index * candleSpacing + (candleSpacing - candleWidth) / 2
    const volumeHeight = (candle.volume / maxVolume) * volumeAreaHeight
    const y = volumeAreaY + volumeAreaHeight - volumeHeight
    const isBullish = candle.close > candle.open
    const volumeColor = isBullish
      ? `rgb(${chart.volumePane.bullishColor[0]}, ${chart.volumePane.bullishColor[1]}, ${chart.volumePane.bullishColor[2]})`
      : `rgb(${chart.volumePane.bearishColor[0]}, ${chart.volumePane.bearishColor[1]}, ${chart.volumePane.bearishColor[2]})`
    ctx.fillStyle = volumeColor
    ctx.fillRect(x, y, candleWidth, volumeHeight)
  })
}

/**
 * Export chart with automatic format detection
 *
 * Automatically detects file format from extension and exports accordingly.
 * Supports PNG image export and TXT text export with proper validation.
 *
 * @param chart - Chart instance to export
 * @param outputPath - Output file path
 * @param options - Additional export options
 * @throws ConfigurationError if export fails or format is unsupported
 *
 * @example
 * ```typescript
 * await exportChart(chart, 'chart.png', { background: 'dark' })
 * await exportChart(chart, 'chart.txt')
 * ```
 */
export async function exportChart(
  chart: Chart,
  outputPath: string,
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const ext = extname(outputPath).toLowerCase()
  if (ext === '.txt') {
    exportToText(chart, outputPath)
  } else if (ext === '.png') {
    await exportToImage(chart, { ...options, outputPath })
  } else {
    throw new ConfigurationError(`Unsupported file extension: ${ext}. Use .txt or .png`, 'outputPath')
  }
}
