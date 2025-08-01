/**
 * Candle type enumeration
 *
 * Defines whether a candle represents a bullish (upward) or bearish (downward) price movement.
 * Used for color coding and rendering decisions.
 *
 * @example
 * ```typescript
 * import { CandleType } from '@/types/candlestick'
 *
 * const candle = { open: 100, close: 110, type: CandleType.Bullish }
 * const isBullish = candle.type === CandleType.Bullish // true
 * ```
 */
export enum CandleType {
  /** Bearish candle (close < open) */
  Bearish = 0,
  /** Bullish candle (close > open) */
  Bullish = 1
}

/**
 * Candle data structure
 *
 * Represents a single candlestick with OHLCV (Open, High, Low, Close, Volume) data.
 * This is the core data structure used throughout the charting system.
 *
 * @example
 * ```typescript
 * import { Candle, CandleType } from '@/types/candlestick'
 *
 * const candle: Candle = {
 *   open: 100.50,
 *   high: 105.20,
 *   low: 99.80,
 *   close: 103.10,
 *   volume: 1500.5,
 *   timestamp: 1640995200000,
 *   type: CandleType.Bullish
 * }
 * ```
 */
export interface Candle {
  /** Opening price of the period */
  open: number
  /** Highest price reached during the period */
  high: number
  /** Lowest price reached during the period */
  low: number
  /** Closing price of the period */
  close: number
  /** Volume data for the period (optional) */
  volume?: number
  /** Unix timestamp in milliseconds */
  timestamp: number
  /** Candle type indicating bullish or bearish movement */
  type: CandleType
}

/**
 * Array of candles
 *
 * Represents a collection of candlesticks, typically used for chart data.
 *
 * @example
 * ```typescript
 * import { Candles } from '@/types/candlestick'
 *
 * const candles: Candles = [
 *   { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: 1640995200000, type: 1 },
 *   { open: 103, high: 108, low: 102, close: 106, volume: 1200, timestamp: 1640998800000, type: 1 }
 * ]
 * ```
 */
export type Candles = Candle[]

/**
 * RGB color tuple
 *
 * Represents a color using RGB values (0-255 for each component).
 *
 * @example
 * ```typescript
 * import { RGBColor } from '@/types/candlestick'
 *
 * const red: RGBColor = [255, 0, 0]
 * const green: RGBColor = [0, 255, 0]
 * const blue: RGBColor = [0, 0, 255]
 * ```
 */
export type RGBColor = [number, number, number]

/**
 * Color value - can be string name, RGB tuple, or ANSI code
 *
 * Flexible color type that supports named colors, RGB tuples, or ANSI escape codes.
 * Used throughout the charting system for consistent color application.
 *
 * @example
 * ```typescript
 * import { ColorValue } from '@/types/candlestick'
 *
 * const namedColor: ColorValue = 'red'
 * const rgbColor: ColorValue = [255, 0, 0]
 * const ansiColor: ColorValue = '\x1b[31m'
 * ```
 */
export type ColorValue = string | RGBColor

/**
 * Chart highlights mapping price to color
 *
 * Maps specific price values to colors for highlighting on the chart.
 *
 * @example
 * ```typescript
 * import { ChartHighlights } from '@/types/candlestick'
 *
 * const highlights: ChartHighlights = {
 *   '100.50': 'red',
 *   '105.20': [0, 255, 0],
 *   '99.80': '\x1b[33m'
 * }
 * ```
 */
export type ChartHighlights = Record<string, ColorValue>

/**
 * Chart labels configuration
 *
 * Defines the text labels used in chart information display.
 * These can be customized to support different languages or display preferences.
 *
 * @example
 * ```typescript
 * import { ChartLabels } from '@/types/candlestick'
 *
 * const labels: ChartLabels = {
 *   average: 'Average',
 *   currency: 'USD',
 *   highest: 'High',
 *   lowest: 'Low',
 *   price: 'Current',
 *   variation: 'Change',
 *   volume: 'Volume'
 * }
 * ```
 */
export interface ChartLabels {
  /** Label for average price */
  average: string
  /** Currency symbol or code */
  currency: string
  /** Label for highest price */
  highest: string
  /** Label for lowest price */
  lowest: string
  /** Label for current price */
  price: string
  /** Label for price variation */
  variation: string
  /** Label for volume */
  volume: string
}

/**
 * Chart constants configuration
 *
 * Defines all chart rendering constants including margins, Unicode characters,
 * formatting options, and thresholds. These constants control the visual
 * appearance and behavior of the ASCII chart rendering system.
 *
 * @example
 * ```typescript
 * import { ChartConstants } from '@/types/candlestick'
 *
 * const constants: ChartConstants = {
 *   MARGIN_TOP: 3,
 *   UNICODE_BODY: '┃',
 *   PRECISION: 2
 * }
 * ```
 */
export interface ChartConstants {
  // Margins and internal sizes
  MARGIN_TOP: number
  MARGIN_RIGHT: number
  CHAR_PRECISION: number
  DEC_PRECISION: number
  WIDTH: number
  HEIGHT: number
  Y_AXIS_SPACING: number

  // Numbers formatting
  PRECISION: number
  PRECISION_SMALL: number

  // Chart characters
  UNICODE_BODY: string
  UNICODE_BOTTOM: string
  UNICODE_HALF_BODY_BOTTOM: string
  UNICODE_HALF_BODY_TOP: string
  UNICODE_FILL: string
  UNICODE_TOP: string
  UNICODE_VOID: string
  UNICODE_WICK: string
  UNICODE_WICK_LOWER: string
  UNICODE_WICK_UPPER: string
  UNICODE_Y_AXIS: string
  UNICODE_Y_AXIS_LEFT: string
  UNICODE_Y_AXIS_RIGHT: string

  // Thresholds
  MIN_DIFF_THRESHOLD: number
  MAX_DIFF_THRESHOLD: number

  // Chart options
  Y_AXIS_ON_THE_RIGHT: boolean
  Y_AXIS_ROUND_DIR: 'down' | 'up'
  Y_AXIS_ROUND_MULTIPLIER: number
}

/**
 * Candle set statistics
 *
 * Contains computed statistics for a collection of candles.
 * Used for chart scaling, information display, and analysis.
 *
 * @example
 * ```typescript
 * import { CandleSetStats } from '@/types/candlestick'
 *
 * const stats: CandleSetStats = {
 *   minPrice: 99.80,
 *   maxPrice: 108.50,
 *   minVolume: 500,
 *   maxVolume: 2000,
 *   variation: 2.5,
 *   average: 104.15,
 *   lastPrice: 106.20,
 *   cumulativeVolume: 15000
 * }
 * ```
 */
export interface CandleSetStats {
  /** Minimum price in the candle set */
  minPrice: number
  /** Maximum price in the candle set */
  maxPrice: number
  /** Minimum volume in the candle set */
  minVolume: number
  /** Maximum volume in the candle set */
  maxVolume: number
  /** Price variation percentage from first to last candle */
  variation: number
  /** Average price across all candles */
  average: number
  /** Last (most recent) price */
  lastPrice: number
  /** Total cumulative volume */
  cumulativeVolume: number
}

/**
 * Chart dimensions
 *
 * Represents the width and height of a chart in characters.
 *
 * @example
 * ```typescript
 * import { ChartDimensions } from '@/types/candlestick'
 *
 * const dimensions: ChartDimensions = {
 *   width: 120,
 *   height: 30
 * }
 * ```
 */
export interface ChartDimensions {
  /** Chart width in characters */
  width: number
  /** Chart height in characters */
  height: number
}

/**
 * Display size
 *
 * Represents the current display dimensions in characters.
 * Used for responsive chart sizing.
 *
 * @example
 * ```typescript
 * import { TerminalSize } from '@/types/candlestick'
 *
 * const displaySize: TerminalSize = {
 *   width: process.stdout.columns || 80,
 *   height: process.stdout.rows || 24
 * }
 * ```
 */
export interface TerminalSize {
  /** Display width in characters */
  width: number
  /** Display height in characters */
  height: number
}
