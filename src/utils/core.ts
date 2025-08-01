import { CONSTANTS, COLORS } from '@/constants'
import type { Candles, ColorValue, RGBColor } from '@/types/candlestick'

// Node.js global declarations
declare const process: {
  env: Record<string, string | undefined>
}

/**
 * Format number with compact representation
 *
 * Formats numbers for display in charts with proper precision and scientific notation
 * for very small numbers. Provides consistent formatting across the application.
 *
 * @param value - Number to format (can be number or string)
 * @returns Formatted string with appropriate precision and notation
 *
 * @example
 * ```typescript
 * import { fnum } from '@/utils/core'
 *
 * fnum(1234.56)     // "1,234.56"
 * fnum(0.00001234)  // "0.⦗0×5⦘1234"
 * fnum(1000000)     // "1,000,000"
 * ```
 */
export function fnum(value: number | string): string {
  let numValue: number
  if (typeof value === 'string') {
    try {
      numValue = parseInt(value)
    } catch {
      numValue = parseFloat(value)
    }
  } else {
    numValue = value
  }
  if (!numValue || Math.abs(numValue) >= 1) {
    return Number.isInteger(numValue)
      ? numValue.toLocaleString()
      : numValue.toLocaleString(undefined, {
          minimumFractionDigits: CONSTANTS.PRECISION,
          maximumFractionDigits: CONSTANTS.PRECISION
        })
  }
  const formatted = numValue.toFixed(18)
  const match = formatted.match(/^(0\.)(0{4,})(.{4}).*$/)
  if (match) {
    const [, p1, p2, p3] = match
    return `${p1}⦗0×${p2.length}⦘${p3}`
  }
  return numValue.toFixed(CONSTANTS.PRECISION_SMALL)
}

/**
 * Convert hex color to RGB
 *
 * Converts a hexadecimal color code to RGB values for use in text coloring.
 * Supports both 6-digit hex codes with or without the # prefix.
 *
 * @param hexCode - Hex color code (e.g., "#FF0000" or "FF0000")
 * @returns RGB tuple with values 0-255
 *
 * @example
 * ```typescript
 * import { hexaToRgb } from '@/utils/core'
 *
 * hexaToRgb('#FF0000')  // [255, 0, 0]
 * hexaToRgb('00FF00')   // [0, 255, 0]
 * hexaToRgb('#0000FF')  // [0, 0, 255]
 * ```
 */
export function hexaToRgb(hexCode: string): RGBColor {
  const hex = hexCode.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return [r, g, b]
}

/**
 * Detect if terminal supports truecolor
 *
 * Checks if the current terminal supports 24-bit truecolor ANSI codes.
 * Falls back to basic ANSI colors if truecolor is not supported.
 *
 * @returns True if terminal supports truecolor
 *
 * @example
 * ```typescript
 * const supportsTruecolor = detectTruecolorSupport()
 * ```
 */
function detectTruecolorSupport(): boolean {
  return process.env.FORCE_COLOR === 'true' || (process.env.TERM?.includes('256color') ?? false)
}

/**
 * Get ANSI color for gray values
 */
function getGrayAnsiColor(gray: number): string {
  if (gray > 200) {
    return '\x1b[97m'
  }
  if (gray > 150) {
    return '\x1b[37m'
  }
  if (gray > 100) {
    return '\x1b[90m'
  }
  return '\x1b[30m'
}

/**
 * Get ANSI color for dominant colors
 */
function getDominantAnsiColor(r: number, g: number, b: number): string {
  if (r > g && r > b) {
    return '\x1b[91m'
  }
  if (g > r && g > b) {
    return '\x1b[92m'
  }
  if (b > r && b > g) {
    return '\x1b[94m'
  }
  return '\x1b[37m'
}

/**
 * Get ANSI color for mixed colors
 */
function getMixedAnsiColor(r: number, g: number, b: number): string {
  if (r > 200 && g > 200) {
    return '\x1b[93m'
  }
  if (r > 200 && b > 200) {
    return '\x1b[95m'
  }
  if (g > 200 && b > 200) {
    return '\x1b[96m'
  }
  return '\x1b[37m'
}

/**
 * Convert RGB to closest ANSI color
 *
 * Maps RGB values to the closest basic ANSI color code.
 * Provides fallback coloring when truecolor is not supported.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns ANSI color code
 *
 * @example
 * ```typescript
 * const ansiColor = rgbToAnsi(255, 0, 0) // Returns red ANSI code
 * ```
 */
function rgbToAnsi(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta < 30) {
    const gray = Math.round((r + g + b) / 3)
    return getGrayAnsiColor(gray)
  }
  const dominantColor = getDominantAnsiColor(r, g, b)
  if (dominantColor !== '\x1b[37m') {
    return dominantColor
  }
  return getMixedAnsiColor(r, g, b)
}

/**
 * Create colorized text with fallback support
 *
 * Applies color to text using truecolor if supported, otherwise falls back
 * to basic ANSI colors. Provides consistent coloring across different terminals.
 *
 * @param value - Text to colorize
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Text wrapped with appropriate color escape sequences
 *
 * @example
 * ```typescript
 * import { colorize } from '@/utils/core'
 *
 * const redText = colorize('Hello', 255, 0, 0)
 * const greenText = colorize('World', 0, 255, 0)
 * ```
 */
export function colorize(value: string, r: number, g: number, b: number): string {
  if (detectTruecolorSupport()) {
    return `\x1b[38;2;${r};${g};${b}m${value}\x1b[00m`
  }
  const ansiColor = rgbToAnsi(r, g, b)
  return `${ansiColor}${value}\x1b[00m`
}

/**
 * Create true color ANSI escape sequence
 *
 * Applies true color (24-bit) ANSI coloring to text using RGB values.
 * This provides more precise color control than the basic 8-color ANSI palette.
 *
 * @param value - Text to colorize
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Text wrapped with ANSI color escape sequences
 *
 * @example
 * ```typescript
 * import { truecolor } from '@/utils/core'
 *
 * const redText = truecolor('Hello', 255, 0, 0)
 * const greenText = truecolor('World', 0, 255, 0)
 * ```
 */
export function truecolor(value: string, r: number, g: number, b: number): string {
  return colorize(value, r, g, b)
}

/**
 * Apply color to text using various color formats
 *
 * Supports multiple color input formats including named colors, RGB tuples,
 * and ANSI escape codes. Provides flexible color application for terminal
 * output with automatic color code handling and reset sequences.
 *
 * @param text - Text to colorize
 * @param value - Color value (name, RGB tuple, or ANSI code)
 * @returns Colored text with appropriate ANSI escape sequences
 *
 * @example
 * ```typescript
 * import { color } from '@/utils/core'
 *
 * const redText = color('Error', 'red')
 * const greenText = color('Success', [0, 255, 0])
 * const blueText = color('Info', '\x1b[34m')
 * ```
 */
export function color(text: string, value: ColorValue): string {
  if (!value) {
    return text
  }
  if (Array.isArray(value)) {
    return truecolor(text, ...value)
  }
  if (typeof value === 'string' && !value.includes('m')) {
    const colorCode = COLORS[value as keyof typeof COLORS]
    if (colorCode) {
      return `${colorCode}${text}\x1b[00m`
    }
  }
  if (typeof value === 'string') {
    return `\x1b[${value}${text}\x1b[00m`
  }
  return text
}

/**
 * Round price according to chart configuration settings
 *
 * Applies price rounding based on chart constants configuration including
 * rounding direction and multiplier settings. Ensures consistent price
 * display across the chart with proper decimal precision.
 *
 * @param value - Price value to round
 * @returns Formatted price string with appropriate rounding applied
 *
 * @example
 * ```typescript
 * import { roundPrice } from '@/utils/core'
 *
 * const rounded = roundPrice(123.456) // "123.46" (with 2 decimal precision)
 * ```
 */
export function roundPrice(value: number): string {
  if (CONSTANTS.Y_AXIS_ROUND_MULTIPLIER > 0) {
    const multiplier = CONSTANTS.Y_AXIS_ROUND_MULTIPLIER
    if (CONSTANTS.Y_AXIS_ROUND_DIR === 'down') {
      value = Math.floor(value * multiplier) / multiplier
    } else {
      value = Math.ceil(value * multiplier) / multiplier
    }
  }
  return formatPrice(value)
}

/**
 * Format price with consistent decimal display
 *
 * Formats price values using locale-specific number formatting with
 * consistent decimal precision as defined in chart constants.
 * Provides standardized price display across the application.
 *
 * @param value - Price value to format
 * @returns Formatted price string with consistent decimal precision
 *
 * @example
 * ```typescript
 * import { formatPrice } from '@/utils/core'
 *
 * const formatted = formatPrice(1234.56) // "1,234.56"
 * const formatted2 = formatPrice(50000) // "50,000.00"
 * ```
 */
export function formatPrice(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: CONSTANTS.PRECISION,
    maximumFractionDigits: CONSTANTS.PRECISION
  })
}

/**
 * Create candles from data iterator
 *
 * Converts raw data objects from an iterator into properly formatted candle
 * objects with automatic type determination (bullish/bearish) based on
 * open/close price relationship. Handles data type conversion and validation.
 *
 * @param iterator - Data iterator containing raw OHLCV objects
 * @returns Array of properly formatted candle objects
 *
 * @example
 * ```typescript
 * import { makeCandles } from '@/utils/core'
 *
 * const rawData = [
 *   { open: '100', high: '105', low: '99', close: '103', volume: '1000', timestamp: '1640995200000' },
 *   { open: '103', high: '108', low: '102', close: '106', volume: '1200', timestamp: '1640998800000' }
 * ]
 * const candles = makeCandles(rawData)
 * ```
 */
export function makeCandles(iterator: Iterable<Record<string, unknown>>): Candles {
  return Array.from(iterator).map(item => ({
    open: parseFloat(String(item.open)),
    high: parseFloat(String(item.high)),
    low: parseFloat(String(item.low)),
    close: parseFloat(String(item.close)),
    volume: parseFloat(String(item.volume || '0')),
    timestamp: parseFloat(String(item.timestamp || '0')),
    type: parseFloat(String(item.open)) < parseFloat(String(item.close)) ? 1 : 0
  }))
}

/**
 * Parse candles from CSV string data
 *
 * Converts CSV-formatted string data into candle objects with automatic
 * type determination. Expects CSV with headers for open, high, low, close,
 * volume, and timestamp columns. Handles data validation and type conversion.
 *
 * @param csvData - CSV data as string with headers
 * @returns Array of properly formatted candle objects
 *
 * @example
 * ```typescript
 * import { parseCandlesFromCsv } from '@/utils/core'
 *
 * const csvData = `open,high,low,close,volume,timestamp
 * 100,105,99,103,1000,1640995200000
 * 103,108,102,106,1200,1640998800000`
 * const candles = parseCandlesFromCsv(csvData)
 * ```
 */
export function parseCandlesFromCsv(csvData: string): Candles {
  const lines = csvData.trim().split('\n')
  const headers = lines[0].split(',')
  const data = lines.slice(1)
  return data
    .map(line => {
      const values = line.split(',')
      const item: Record<string, unknown> = {}
      headers.forEach((header, index) => {
        item[header.trim()] = values[index]?.trim() || '0'
      })
      return item
    })
    .map(item => ({
      open: parseFloat(String(item.open)),
      high: parseFloat(String(item.high)),
      low: parseFloat(String(item.low)),
      close: parseFloat(String(item.close)),
      volume: parseFloat(String(item.volume || '0')),
      timestamp: parseFloat(String(item.timestamp || '0')),
      type: parseFloat(String(item.open)) < parseFloat(String(item.close)) ? 1 : 0
    }))
}

/**
 * Parse candles from JSON string data
 *
 * Converts JSON-formatted string data into candle objects with automatic
 * type determination. Expects JSON array of objects with OHLCV properties.
 * Handles data validation and type conversion using makeCandles utility.
 *
 * @param jsonData - JSON data as string
 * @returns Array of properly formatted candle objects
 *
 * @example
 * ```typescript
 * import { parseCandlesFromJson } from '@/utils/core'
 *
 * const jsonData = `[
 *   {"open": 100, "high": 105, "low": 99, "close": 103, "volume": 1000, "timestamp": 1640995200000},
 *   {"open": 103, "high": 108, "low": 102, "close": 106, "volume": 1200, "timestamp": 1640998800000}
 * ]`
 * const candles = parseCandlesFromJson(jsonData)
 * ```
 */
export function parseCandlesFromJson(jsonData: string): Candles {
  const data = JSON.parse(jsonData)
  return makeCandles(data)
}

/**
 * Convert MarketData array to Candles with automatic type determination
 *
 * Transforms raw market data objects into properly formatted candle objects
 * with automatic bullish/bearish type determination based on open/close
 * price relationship. Handles data validation and type conversion.
 *
 * @param marketData - Array of market data objects with OHLCV properties
 * @returns Array of properly formatted candle objects with type field
 *
 * @example
 * ```typescript
 * import { convertMarketDataToCandles } from '@/utils/core'
 *
 * const marketData = [
 *   { timestamp: 1640995200000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
 *   { timestamp: 1640998800000, open: 103, high: 108, low: 102, close: 106, volume: 1200 }
 * ]
 * const candles = convertMarketDataToCandles(marketData)
 * ```
 */
export function convertMarketDataToCandles(
  marketData: Array<{
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
): Candles {
  return marketData.map(data => ({
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume,
    timestamp: data.timestamp,
    type: data.open < data.close ? 1 : 0
  }))
}
