/**
 * Market data structure from data source
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
