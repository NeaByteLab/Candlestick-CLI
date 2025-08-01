import { CONSTANTS, COLORS } from '@/constants'
import type { Candles, ColorValue, RGBColor } from '@/types/candlestick'

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
  return `\x1b[38;2;${r};${g};${b}m${value}\x1b[00m`
}

/**
 * Apply color to text
 * @param text - Text to colorize
 * @param value - Color value (name, RGB, or ANSI code)
 * @returns Colored text
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
 * Round price according to chart settings
 * @param value - Price to round
 * @returns Formatted price string
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
 * @param value - Price to format
 * @returns Formatted price string with decimals
 */
export function formatPrice(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: CONSTANTS.PRECISION,
    maximumFractionDigits: CONSTANTS.PRECISION
  })
}

/**
 * Create candles from data iterator
 * @param iterator - Data iterator
 * @returns Array of candles
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
 * Parse candles from CSV string
 * @param csvData - CSV data as string
 * @returns Array of candles
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
 * Parse candles from JSON string
 * @param jsonData - JSON data as string
 * @returns Array of candles
 */
export function parseCandlesFromJson(jsonData: string): Candles {
  const data = JSON.parse(jsonData)
  return makeCandles(data)
}
