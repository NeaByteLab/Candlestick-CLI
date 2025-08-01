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
 * Exports the chart content to a plain text file, optionally preserving
 * ANSI color codes for terminal display. Creates the output directory
 * if it doesn't exist and handles file writing errors gracefully.
 *
 * @param chart - Chart instance to export
 * @param outputPath - Output file path
 * @param preserveColors - Whether to preserve ANSI color codes (default: false)
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
 * Converts the chart to a PNG image with customizable dimensions, background,
 * and font settings. Uses canvas API for high-quality rendering with proper
 * color support and text positioning.
 *
 * @param chart - Chart instance to export
 * @param options - Export configuration options
 * @throws ConfigurationError if export fails
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
 * Ensures all required export options are present and valid.
 * Checks for required outputPath and validates optional parameters.
 *
 * @param options - Export options to validate
 * @throws ConfigurationError if options are invalid
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
 * Checks if the output path has a valid extension and format.
 * Supports .txt and .png file extensions.
 *
 * @param outputPath - File path to validate
 * @throws ConfigurationError if path is invalid
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
 * Creates the parent directory for the specified file path if it doesn't exist.
 * Handles nested directory creation and permission errors gracefully.
 *
 * @param filePath - File path whose directory should be created
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
 * Removes all ANSI escape sequences from text content while preserving
 * the actual text content. Used for length calculations and plain text output.
 *
 * @param content - Text content with ANSI codes
 * @returns Text content without ANSI codes
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
 * Renders the chart content to a canvas element by drawing actual candle
 * rectangles and wicks instead of converting Unicode text. This ensures
 * proper candlestick visualization in the exported image.
 *
 * @param chart - Chart instance to render
 * @param options - Export options including scale and theme
 * @throws ConfigurationError if rendering fails
 */
async function renderChartToCanvas(chart: Chart, options: ExportOptions): Promise<void> {
  const { createCanvas } = await import('canvas')
  const theme = options.background || 'dark'
  const backgroundColor = theme === 'light' ? '#ffffff' : '#000000'
  const scale = options.scale || 1
  const { candles } = chart.chartData.visibleCandleSet
  if (candles.length === 0) {
    throw new ConfigurationError('No candles to render', 'chart')
  }
  const { maxPrice, priceRange } = calculatePriceRange(candles)
  const { finalWidth, finalHeight, actualScale } = calculateCanvasDimensions(scale, chart)
  const { chartAreaX, chartAreaY, chartAreaWidthScaled, chartAreaHeightScaled } = calculateChartArea(actualScale)
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
}

/**
 * Calculate price range from candles
 *
 * Determines the minimum and maximum prices from the candle dataset to establish
 * the price range for chart scaling. Used for proper Y-axis scaling and price
 * label positioning in exported images.
 *
 * @param candles - Array of candles to analyze
 * @returns Object containing maximum price and price range
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
 * Computes optimal canvas dimensions based on scale factor and chart configuration.
 * Handles maximum canvas size limits and ensures minimum dimensions for readability.
 * Applies intelligent scaling to maintain aspect ratio and prevent oversized images.
 *
 * @param scale - Scale factor for image export
 * @param chart - Chart instance with volume pane configuration
 * @returns Object containing final dimensions and actual scale factor
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
  const chartAreaWidth = 800 * scale
  const chartAreaHeight = 400 * scale
  const volumeHeight = chart.volumePane.enabled ? 100 * scale : 0
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
 * Determines the chart area positioning and dimensions within the canvas.
 * Calculates scaled coordinates for proper chart rendering with margins
 * and padding. Used for positioning candles and price labels accurately.
 *
 * @param actualScale - Actual scale factor applied to canvas
 * @returns Object containing chart area coordinates and dimensions
 *
 * @example
 * ```typescript
 * const { chartAreaX, chartAreaY, chartAreaWidthScaled, chartAreaHeightScaled } = calculateChartArea(1.5)
 * console.log(`Chart area: ${chartAreaWidthScaled}x${chartAreaHeightScaled} at (${chartAreaX}, ${chartAreaY})`)
 * ```
 */
function calculateChartArea(actualScale: number): {
  chartAreaX: number
  chartAreaY: number
  chartAreaWidthScaled: number
  chartAreaHeightScaled: number
} {
  const padding = 40
  const chartAreaWidth = 800
  const chartAreaHeight = 400
  const chartAreaX = (padding + 120) * actualScale
  const chartAreaY = (padding + 20) * actualScale
  const chartAreaWidthScaled = chartAreaWidth * actualScale
  const chartAreaHeightScaled = chartAreaHeight * actualScale
  return { chartAreaX, chartAreaY, chartAreaWidthScaled, chartAreaHeightScaled }
}

/**
 * Calculate candle dimensions for rendering
 *
 * Computes optimal candle width and spacing based on available chart area
 * and number of candles. Ensures candles are visible and properly spaced
 * for clear visualization in exported images.
 *
 * @param chartAreaWidthScaled - Available chart area width in pixels
 * @param candleCount - Number of candles to display
 * @returns Object containing candle width and spacing values
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
  const priceStep = priceRange / 5
  for (let i = 0; i <= 5; i++) {
    const price = maxPrice - priceStep * i
    const y = chartAreaY + ((priceStep * i) / priceRange) * chartAreaHeightScaled
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
