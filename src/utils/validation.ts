import { ValidationError } from '@/types/errors'
import type { Candle, Candles } from '@/types/candlestick'

/**
 * Validate non-negative number
 *
 * Internal helper function for validating that a value is a non-negative number.
 * Used by various validation functions to ensure positive numeric values.
 *
 * @param value - Number value to validate
 * @param field - Field name for error messages
 * @throws ValidationError if value is not a non-negative number
 */
function validateNonNegativeNumber(value: number, field: string): void {
  if (typeof value !== 'number' || value < 0) {
    throw new ValidationError(`${field} must be a non-negative number`, field.toLowerCase())
  }
}

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
 * Validate individual color component
 *
 * Internal helper function for validating individual RGB color components.
 * Ensures the component is a valid number within the 0-255 range.
 *
 * @param value - Color component value to validate
 * @param component - Component name for error messages
 * @throws ValidationError if component is invalid
 */
function validateColorComponent(value: number, component: string): void {
  if (typeof value !== 'number' || value < 0 || value > 255) {
    throw new ValidationError(`${component} component must be a number between 0 and 255`, component.toLowerCase())
  }
}

/**
 * Validate RGB color components
 *
 * Ensures all RGB color components are valid numbers within the 0-255 range.
 * Used for validating color inputs before applying them to chart elements.
 * Throws ValidationError if any component is invalid.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @throws ValidationError if any component is invalid
 *
 * @example
 * ```typescript
 * import { validateRGBColor } from '@/utils/validation'
 *
 * try {
 *   validateRGBColor(255, 0, 0) // Valid red color
 *   validateRGBColor(0, 255, 0) // Valid green color
 * } catch (error) {
 *   console.error('Invalid color:', error.message)
 * }
 * ```
 */
export function validateRGBColor(r: number, g: number, b: number): void {
  validateColorComponent(r, 'Red')
  validateColorComponent(g, 'Green')
  validateColorComponent(b, 'Blue')
}

/**
 * Validate chart dimensions
 *
 * Ensures chart width and height are valid positive numbers within
 * reasonable bounds for terminal display. Validates minimum and maximum
 * dimensions to prevent rendering issues.
 *
 * @param width - Chart width in characters
 * @param height - Chart height in characters
 * @throws ValidationError if dimensions are invalid
 *
 * @example
 * ```typescript
 * import { validateChartDimensions } from '@/utils/validation'
 *
 * try {
 *   validateChartDimensions(120, 30) // Valid dimensions
 *   validateChartDimensions(50, 20)  // Valid dimensions
 * } catch (error) {
 *   console.error('Invalid dimensions:', error.message)
 * }
 * ```
 */
export function validateChartDimensions(width: number, height: number): void {
  validateNonNegativeNumber(width, 'Chart width')
  validateNonNegativeNumber(height, 'Chart height')
}

/**
 * Validate chart margins
 *
 * Ensures all margin values are valid non-negative numbers within
 * reasonable bounds for chart display. Validates individual margin
 * components to prevent layout issues.
 *
 * @param top - Top margin in characters
 * @param right - Right margin in characters
 * @param bottom - Bottom margin in characters
 * @param left - Left margin in characters
 * @throws ValidationError if any margin is invalid
 *
 * @example
 * ```typescript
 * import { validateMargins } from '@/utils/validation'
 *
 * try {
 *   validateMargins(3, 4, 2, 0) // Valid margins
 *   validateMargins(5, 6, 3, 1) // Valid margins
 * } catch (error) {
 *   console.error('Invalid margins:', error.message)
 * }
 * ```
 */
export function validateMargins(top: number, right: number, bottom: number, left: number): void {
  validateNonNegativeNumber(top, 'Top margin')
  validateNonNegativeNumber(right, 'Right margin')
  validateNonNegativeNumber(bottom, 'Bottom margin')
  validateNonNegativeNumber(left, 'Left margin')
}

/**
 * Validate time range for chart scaling
 *
 * Ensures time range indices are valid for chart data access. Validates
 * that start and end indices are within bounds and that start is less
 * than or equal to end. Used for fixed scaling mode validation.
 *
 * @param startIndex - Starting candle index (inclusive)
 * @param endIndex - Ending candle index (inclusive)
 * @param maxLength - Maximum length of candle array
 * @throws ValidationError if time range is invalid
 *
 * @example
 * ```typescript
 * import { validateTimeRange } from '@/utils/validation'
 *
 * try {
 *   validateTimeRange(0, 99, 100) // Valid range for 100 candles
 *   validateTimeRange(10, 50, 100) // Valid range
 * } catch (error) {
 *   console.error('Invalid time range:', error.message)
 * }
 * ```
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
