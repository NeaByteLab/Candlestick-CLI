/**
 * Base error class for Candlestick-CLI library
 *
 * Provides a foundation for all custom errors in the library.
 * Includes error codes for programmatic error handling.
 *
 * @example
 * ```typescript
 * import { OHLCError } from '@/types/errors'
 *
 * throw new OHLCError('Invalid candle data', 'INVALID_DATA')
 * ```
 */
export class OHLCError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = 'OHLCError'
  }
}

/**
 * Error thrown when market data fetching fails
 *
 * Used when there are issues with external data sources,
 * network connectivity, or invalid trading symbols.
 *
 * @example
 * ```typescript
 * import { MarketDataError } from '@/types/errors'
 *
 * throw new MarketDataError('Symbol not found', 'BTC/USDT', '1h')
 * ```
 */
export class MarketDataError extends OHLCError {
  constructor(
    message: string,
    public readonly symbol?: string,
    public readonly timeframe?: string
  ) {
    super(message, 'MARKET_DATA_ERROR')
    this.name = 'MarketDataError'
  }
}

/**
 * Error thrown when chart rendering fails
 *
 * Used when there are issues with chart generation,
 * terminal output, or rendering calculations.
 *
 * @example
 * ```typescript
 * import { ChartRenderError } from '@/types/errors'
 *
 * throw new ChartRenderError('Failed to render chart', 'chart-001')
 * ```
 */
export class ChartRenderError extends OHLCError {
  constructor(
    message: string,
    public readonly chartId?: string
  ) {
    super(message, 'CHART_RENDER_ERROR')
    this.name = 'ChartRenderError'
  }
}

/**
 * Error thrown when data validation fails
 *
 * Used when input data doesn't meet required format
 * or validation criteria.
 *
 * @example
 * ```typescript
 * import { ValidationError } from '@/types/errors'
 *
 * throw new ValidationError('Invalid price value', 'price')
 * ```
 */
export class ValidationError extends OHLCError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * Error thrown when terminal operations fail
 *
 * Used when there are issues with terminal output,
 * display capabilities, or console operations.
 *
 * @example
 * ```typescript
 * import { TerminalError } from '@/types/errors'
 *
 * throw new TerminalError('Terminal not supported')
 * ```
 */
export class TerminalError extends OHLCError {
  constructor(message: string) {
    super(message, 'TERMINAL_ERROR')
    this.name = 'TerminalError'
  }
}

/**
 * Error thrown when configuration is invalid
 *
 * Used when chart configuration parameters are invalid
 * or incompatible with the current setup.
 *
 * @example
 * ```typescript
 * import { ConfigurationError } from '@/types/errors'
 *
 * throw new ConfigurationError('Invalid chart dimensions', 'dimensions')
 * ```
 */
export class ConfigurationError extends OHLCError {
  constructor(
    message: string,
    public readonly config?: string
  ) {
    super(message, 'CONFIGURATION_ERROR')
    this.name = 'ConfigurationError'
  }
}

/**
 * Error types enumeration
 *
 * Defines all possible error types in the library.
 * Used for error categorization and handling.
 *
 * @example
 * ```typescript
 * import { ErrorType } from '@/types/errors'
 *
 * switch (error.code) {
 *   case ErrorType.MARKET_DATA:
 *     console.error('Market data error')
 *     break
 *   case ErrorType.VALIDATION:
 *     console.error('Validation error')
 *     break
 * }
 * ```
 */
export enum ErrorType {
  /** Configuration-related errors */
  CONFIGURATION = 'CONFIGURATION_ERROR',
  /** Chart rendering errors */
  CHART_RENDER = 'CHART_RENDER_ERROR',
  /** Market data fetching errors */
  MARKET_DATA = 'MARKET_DATA_ERROR',
  /** Terminal output errors */
  TERMINAL = 'TERMINAL_ERROR',
  /** Data validation errors */
  VALIDATION = 'VALIDATION_ERROR'
}
