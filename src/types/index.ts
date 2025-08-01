/**
 * Market data structure from external data sources
 *
 * Represents raw market data as received from cryptocurrency exchanges or
 * other data providers. This interface defines the standard format for
 * OHLCV (Open, High, Low, Close, Volume) data before conversion to
 * internal candle format.
 *
 * @example
 * ```typescript
 * import type { MarketData } from '@/types'
 *
 * const marketData: MarketData = {
 *   timestamp: 1640995200000,
 *   open: 50000.0,
 *   high: 51000.0,
 *   low: 49000.0,
 *   close: 50500.0,
 *   volume: 1500.5
 * }
 * ```
 */
export interface MarketData {
  /** Unix timestamp in milliseconds */
  timestamp: number
  /** Opening price */
  open: number
  /** Highest price in period */
  high: number
  /** Lowest price in period */
  low: number
  /** Closing price */
  close: number
  /** Volume data */
  volume: number
}

// Re-export candlestick types
export * from './candlestick'
