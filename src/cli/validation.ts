import { existsSync } from 'fs'
import type { CliOptions, RGBColor } from './types'

/**
 * Show figlet banner
 */
async function showBanner(): Promise<void> {
  const { default: figlet } = await import('figlet')
  const banner = figlet.textSync('Candlestick-CLI', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  })
  console.log(banner)
}

// Node.js global declarations
declare const console: Console
declare const process: {
  exit(code?: number): never
}

/**
 * Validate file path and format
 *
 * Checks if the provided file path exists and has a supported format.
 * Throws descriptive errors for invalid files.
 *
 * @param filePath - Path to the file to validate
 * @throws Error if file path is missing, format is unsupported, or file doesn't exist
 *
 * @example
 * ```typescript
 * validateFile('data.csv')     // Valid
 * validateFile('data.txt')     // Error: Unsupported format
 * validateFile('nonexistent.csv') // Error: File not found
 * ```
 */
export function validateFile(filePath: string): void {
  if (!filePath) {
    throw new Error('File path is required. Use --file or -f option.')
  }
  if (!filePath.endsWith('.csv') && !filePath.endsWith('.json')) {
    throw new Error('Unsupported file format. Use .csv or .json files.')
  }
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
}

/**
 * Validate live data options
 *
 * Ensures that symbol, timeframe, and limit parameters are valid for live data fetching.
 * Validates symbol format, timeframe values, and limit ranges.
 * Supports perpetual futures symbols with :USDT suffix.
 *
 * @param symbol - Trading symbol to validate
 * @param timeframe - Timeframe to validate
 * @param limit - Number of candles to validate
 * @throws Error if any parameter is invalid
 *
 * @example
 * ```typescript
 * validateLiveDataOptions('BTC/USDT', '1h', 100)
 * validateLiveDataOptions('BTC/USDT:USDT', '1h', 100)
 * ```
 */
export function validateLiveDataOptions(symbol: string, timeframe: string, limit: number): void {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Symbol is required for live data. Use --symbol or -s option.')
  }
  const validSymbolPattern = /^[A-Z]+\/[A-Z]+(:[A-Z]+)?$/
  if (!validSymbolPattern.test(symbol)) {
    throw new Error(`Invalid symbol format: ${symbol}. Use format like BTC/USDT or BTC/USDT:USDT`)
  }
  const validTimeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M']
  if (!validTimeframes.includes(timeframe)) {
    throw new Error(`Invalid timeframe: ${timeframe}. Supported: ${validTimeframes.join(', ')}`)
  }
  if (limit < 5 || limit > 10000) {
    throw new Error('Limit must be between 5 and 10,000 candles')
  }
}

/**
 * Validate required candle fields
 *
 * Checks that a candle object has all required numeric fields
 * with valid values. Ensures data integrity for chart rendering.
 *
 * @param candle - Candle object to validate
 * @param index - Index of the candle for error reporting
 * @throws Error if required fields are missing or invalid
 *
 * @example
 * ```typescript
 * validateCandleFields({ open: 100, high: 105, low: 99, close: 103 }, 0)
 * ```
 */
export function validateCandleFields(candle: Record<string, unknown>, index: number): void {
  const requiredFields = ['open', 'high', 'low', 'close']
  for (const field of requiredFields) {
    if (typeof candle[field] !== 'number' || isNaN(candle[field] as number)) {
      throw new Error(`Invalid ${field} value at candle ${index + 1}: ${candle[field]}`)
    }
  }
}

/**
 * Validate OHLC (Open, High, Low, Close) relationships
 *
 * Ensures that OHLC values follow proper candlestick logic:
 * - High must be >= Low
 * - All prices must be non-negative
 * - Maintains data integrity for accurate chart rendering
 *
 * @param candle - Candle object to validate
 * @param index - Index of the candle for error reporting
 * @throws Error if OHLC relationships are invalid
 *
 * @example
 * ```typescript
 * validateCandleOHLC({ open: 100, high: 105, low: 99, close: 103 }, 0)
 * ```
 */
export function validateCandleOHLC(candle: Record<string, unknown>, index: number): void {
  const high = candle.high as number
  const low = candle.low as number
  const open = candle.open as number
  const close = candle.close as number
  if (high < low) {
    throw new Error(`Invalid OHLC at candle ${index + 1}: high (${high}) cannot be less than low (${low})`)
  }
  if (open < 0 || high < 0 || low < 0 || close < 0) {
    throw new Error(`Invalid negative price at candle ${index + 1}`)
  }
}

/**
 * Validate candle volume data
 *
 * Checks that volume data (if present) is valid and non-negative.
 * Volume is optional but must be valid when provided.
 *
 * @param candle - Candle object to validate
 * @param index - Index of the candle for error reporting
 * @throws Error if volume data is invalid
 *
 * @example
 * ```typescript
 * validateCandleVolume({ open: 100, close: 103, volume: 1500 }, 0)
 * ```
 */
export function validateCandleVolume(candle: Record<string, unknown>, index: number): void {
  if (candle.volume !== undefined) {
    if (typeof candle.volume !== 'number' || isNaN(candle.volume as number)) {
      throw new Error(`Invalid volume value at candle ${index + 1}: ${candle.volume}`)
    }
    if ((candle.volume as number) < 0) {
      throw new Error(`Invalid negative volume at candle ${index + 1}`)
    }
  }
}

/**
 * Validate complete candle dataset
 *
 * Performs validation on an array of candles,
 * including field validation, OHLC relationships, and volume data.
 * Ensures dataset integrity for reliable chart rendering.
 *
 * @param candles - Array of candle objects to validate
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * validateData([
 *   { open: 100, high: 105, low: 99, close: 103, volume: 1500 },
 *   { open: 103, high: 108, low: 102, close: 106, volume: 1800 }
 * ])
 * ```
 */
export function validateData(candles: unknown[]): void {
  if (!Array.isArray(candles)) {
    throw new Error('Data must be an array of candles')
  }

  if (candles.length < 5) {
    throw new Error(`Insufficient data: ${candles.length} candles. Minimum required: 5`)
  }

  if (candles.length > 10000) {
    throw new Error(`Too much data: ${candles.length} candles. Maximum allowed: 10,000`)
  }

  candles.forEach((candle, index) => {
    validateCandleFields(candle as Record<string, unknown>, index)
    validateCandleOHLC(candle as Record<string, unknown>, index)
    validateCandleVolume(candle as Record<string, unknown>, index)
  })
}

/**
 * Parse color string into RGB values
 *
 * Converts color strings in various formats (hex, RGB) into
 * RGB tuple values for use in chart coloring.
 *
 * @param color - Color string in hex (#ff0000) or RGB (255,0,0) format
 * @returns RGB tuple [r, g, b] or undefined if parsing fails
 *
 * @example
 * ```typescript
 * parseColor('#ff0000')  // [255, 0, 0]
 * parseColor('255,0,0')  // [255, 0, 0]
 * parseColor('invalid')  // undefined
 * ```
 */
export function parseColor(color: string): RGBColor | undefined {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return [r, g, b]
  }
  if (color.includes(',')) {
    const [r, g, b] = color.split(',').map(x => parseInt(x.trim()))
    return [r, g, b]
  }
  return undefined
}

/**
 * Validate color format and convert to RGB
 *
 * Parses color strings in hex or RGB format and validates them.
 * Converts valid colors to RGB tuple format for chart rendering.
 *
 * @param color - Color string in hex (#ff0000) or RGB (255,0,0) format
 * @param colorName - Name of the color for error reporting
 * @returns RGB tuple [r, g, b]
 * @throws Error if color format is invalid
 *
 * @example
 * ```typescript
 * validateColor('#ff0000', 'bear') // [255, 0, 0]
 * validateColor('255,0,0', 'bull') // [255, 0, 0]
 * ```
 */
export function validateColor(color: string, colorName: string): RGBColor {
  const rgb = parseColor(color)
  if (!rgb) {
    throw new Error(`Invalid ${colorName} color format: ${color}. Use hex (#ff0000) or RGB (255,0,0) format.`)
  }
  return rgb
}

/**
 * Validate chart dimensions
 *
 * Ensures width and height values are within acceptable ranges.
 * Provides fallback values for auto-detection (0 values).
 *
 * @param width - Chart width to validate
 * @param height - Chart height to validate
 * @throws Error if dimensions are invalid
 *
 * @example
 * ```typescript
 * validateDimensions(120, 30) // Valid
 * validateDimensions(0, 0)    // Valid (auto-detect)
 * ```
 */
export function validateDimensions(width?: number, height?: number): void {
  if (width !== undefined && (width < 0 || width > 1000)) {
    throw new Error('Width must be between 0 and 1000')
  }
  if (height !== undefined && (height < 0 || height > 1000)) {
    throw new Error('Height must be between 0 and 1000')
  }
}

/**
 * Validate volume pane height
 *
 * Ensures volume pane height is within acceptable range for display.
 * Volume pane height affects overall chart layout and readability.
 *
 * @param volumeHeight - Volume pane height to validate
 * @throws Error if height is invalid
 *
 * @example
 * ```typescript
 * validateVolumeHeight(5)  // Valid
 * validateVolumeHeight(10) // Valid
 * ```
 */
export function validateVolumeHeight(volumeHeight?: number): void {
  if (volumeHeight !== undefined && (volumeHeight < 1 || volumeHeight > 20)) {
    throw new Error('Volume height must be between 1 and 20')
  }
}

/**
 * Validate input source options
 *
 * Ensures either file or symbol is provided, but not both.
 * Validates that exactly one data source is specified for chart generation.
 * Exits process with error message if validation fails.
 *
 * @param options - CLI options to validate
 * @throws Error if no data source or multiple sources are specified
 *
 * @example
 * ```typescript
 * validateInputSource({ file: 'data.csv' }) // Valid
 * validateInputSource({ symbol: 'BTC/USDT' }) // Valid
 * validateInputSource({}) // Error: no source
 * ```
 */
export async function validateInputSource(options: CliOptions): Promise<void> {
  if (!options.file && !options.symbol) {
    await showBanner()
    console.error('❌ Error: Either file path or symbol is required.')
    console.error('💡 Use --file/-f for file input or --symbol/-s for live data.')
    console.error('💡 Use --help for more information.')
    process.exit(1)
  }

  if (options.file && options.symbol) {
    await showBanner()
    console.error('❌ Error: Cannot use both file and symbol options.')
    console.error('💡 Use either --file/-f OR --symbol/-s, not both.')
    process.exit(1)
  }
}
