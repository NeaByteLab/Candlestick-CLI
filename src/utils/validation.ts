import { ValidationError } from '@/types/errors'
import type { Candle, Candles } from '@/types/candlestick'

/**
 * Validate candle data
 *
 * Performs comprehensive validation of a single candle object, checking:
 * - All required fields are present and are valid numbers
 * - Price relationships are logical (high >= max(open,close), low <= min(open,close))
 * - Volume is non-negative
 *
 * @param candle - Candle object to validate
 * @throws ValidationError if candle data is invalid
 *
 * @example
 * ```typescript
 * import { validateCandle } from '@/utils/validation'
 *
 * try {
 *   validateCandle({
 *     open: 100, high: 105, low: 99, close: 103,
 *     volume: 1000, timestamp: 1640995200000, type: 1
 *   })
 * } catch (error) {
 *   console.error('Invalid candle:', error.message)
 * }
 * ```
 */
export function validateCandle(candle: Candle): void {
  if (!candle) {
    throw new ValidationError('Candle cannot be null or undefined', 'candle')
  }
  if (typeof candle.open !== 'number' || isNaN(candle.open)) {
    throw new ValidationError('Candle open price must be a valid number', 'open')
  }
  if (typeof candle.high !== 'number' || isNaN(candle.high)) {
    throw new ValidationError('Candle high price must be a valid number', 'high')
  }
  if (typeof candle.low !== 'number' || isNaN(candle.low)) {
    throw new ValidationError('Candle low price must be a valid number', 'low')
  }
  if (typeof candle.close !== 'number' || isNaN(candle.close)) {
    throw new ValidationError('Candle close price must be a valid number', 'close')
  }
  if (typeof candle.timestamp !== 'number' || isNaN(candle.timestamp)) {
    throw new ValidationError('Candle timestamp must be a valid number', 'timestamp')
  }
  if (candle.high < Math.max(candle.open, candle.close)) {
    throw new ValidationError('Candle high must be >= max(open, close)', 'high')
  }
  if (candle.low > Math.min(candle.open, candle.close)) {
    throw new ValidationError('Candle low must be <= min(open, close)', 'low')
  }
  // Volume is optional, but if provided must be valid
  if (candle.volume !== undefined) {
    if (typeof candle.volume !== 'number' || isNaN(candle.volume)) {
      throw new ValidationError('Candle volume must be a valid number', 'volume')
    }
    if (candle.volume < 0) {
      throw new ValidationError('Candle volume cannot be negative', 'volume')
    }
  }
}

/**
 * Validate array of candles
 *
 * Validates an entire array of candles, ensuring:
 * - The input is a valid array
 * - The array is not empty
 * - Each individual candle passes validation
 *
 * @param candles - Array of candle objects to validate
 * @throws ValidationError if candles array is invalid or contains invalid candles
 *
 * @example
 * ```typescript
 * import { validateCandles } from '@/utils/validation'
 *
 * try {
 *   validateCandles([
 *     { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: 1640995200000, type: 1 },
 *     { open: 103, high: 108, low: 102, close: 106, volume: 1200, timestamp: 1640998800000, type: 1 }
 *   ])
 * } catch (error) {
 *   console.error('Invalid candles:', error.message)
 * }
 * ```
 */
export function validateCandles(candles: Candles): void {
  if (!Array.isArray(candles)) {
    throw new ValidationError('Candles must be an array', 'candles')
  }
  if (candles.length === 0) {
    throw new ValidationError('Candles array cannot be empty', 'candles')
  }

  // Validate candle count limits
  if (candles.length < 5) {
    throw new ValidationError(`Too few candles: ${candles.length}. Minimum required: 5 candles.`, 'candles')
  }
  if (candles.length > 10000) {
    throw new ValidationError(`Too many candles: ${candles.length}. Maximum allowed: 10,000 candles.`, 'candles')
  }

  for (let i = 0; i < candles.length; i++) {
    try {
      validateCandle(candles[i])
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`${error.message} at index ${i}`, error.field)
      }
      throw error
    }
  }
}

/**
 * Validate RGB color values
 * @param r - Red component
 * @param g - Green component
 * @param b - Blue component
 * @throws ValidationError if color values are invalid
 */
function validateColorComponent(value: number, component: string): void {
  if (typeof value !== 'number' || value < 0 || value > 255) {
    throw new ValidationError(`${component} component must be a number between 0 and 255`, component.toLowerCase())
  }
}

export function validateRGBColor(r: number, g: number, b: number): void {
  validateColorComponent(r, 'Red')
  validateColorComponent(g, 'Green')
  validateColorComponent(b, 'Blue')
}

/**
 * Validate chart dimensions
 * @param width - Chart width
 * @param height - Chart height
 * @throws ValidationError if dimensions are invalid
 */
function validateNonNegativeNumber(value: number, field: string): void {
  if (typeof value !== 'number' || value < 0) {
    throw new ValidationError(`${field} must be a non-negative number`, field.toLowerCase())
  }
}

export function validateChartDimensions(width: number, height: number): void {
  validateNonNegativeNumber(width, 'Chart width')
  validateNonNegativeNumber(height, 'Chart height')
}

/**
 * Validate margin values
 * @param top - Top margin
 * @param right - Right margin
 * @param bottom - Bottom margin
 * @param left - Left margin
 * @throws ValidationError if margins are invalid
 */
export function validateMargins(top: number, right: number, bottom: number, left: number): void {
  validateNonNegativeNumber(top, 'Top margin')
  validateNonNegativeNumber(right, 'Right margin')
  validateNonNegativeNumber(bottom, 'Bottom margin')
  validateNonNegativeNumber(left, 'Left margin')
}

/**
 * Validate time range
 * @param startIndex - Start index
 * @param endIndex - End index
 * @param maxLength - Maximum array length
 * @throws ValidationError if time range is invalid
 */
export function validateTimeRange(startIndex: number, endIndex: number, maxLength: number): void {
  validateNonNegativeNumber(startIndex, 'Start index')
  validateNonNegativeNumber(endIndex, 'End index')
  if (startIndex >= maxLength) {
    throw new ValidationError('Start index must be less than array length', 'startIndex')
  }
  if (endIndex >= maxLength) {
    throw new ValidationError('End index must be less than array length', 'endIndex')
  }
  if (startIndex > endIndex) {
    throw new ValidationError('Start index must be <= end index', 'startIndex')
  }
}
