/**
 * CLI options interface for command-line argument parsing
 *
 * Defines all available command-line options for the Candlestick-CLI tool.
 * Each option corresponds to a specific chart configuration parameter.
 *
 * @example
 * ```typescript
 * const options: CliOptions = {
 *   file: 'data.csv',
 *   title: 'BTC/USDT',
 *   width: 120,
 *   height: 30,
 *   bearColor: '#ff6b6b',
 *   bullColor: '#51cf66',
 *   volume: true,
 *   volumeHeight: 5
 * }
 * ```
 */
export interface CliOptions {
  /** Path to CSV or JSON file containing candle data */
  file?: string
  /** Trading symbol for live data (e.g., BTC/USDT) */
  symbol?: string
  /** Timeframe for live data (1h, 4h, 1d) */
  timeframe?: string
  /** Number of candles to fetch for live data */
  limit?: number
  /** Chart title displayed in the header */
  title?: string
  /** Chart width in characters (0 for auto-detect) */
  width?: number
  /** Chart height in characters (0 for auto-detect) */
  height?: number
  /** Bearish candle color in hex or RGB format */
  bearColor?: string
  /** Bullish candle color in hex or RGB format */
  bullColor?: string
  /** Whether to display volume pane */
  volume?: boolean
  /** Volume pane height in lines */
  volumeHeight?: number
  /** Output file path for export */
  output?: string
  /** Scale factor for image export */
  scale?: number
  /** Background theme for image export */
  background?: 'light' | 'dark'
  /** Watch mode for live data updates */
  watch?: boolean
  /** Update interval in seconds for watch mode */
  interval?: number
}

/**
 * RGB color tuple
 *
 * Represents a color using RGB values (0-255 for each component).
 *
 * @example
 * ```typescript
 * const red: RGBColor = [255, 0, 0]
 * const green: RGBColor = [0, 255, 0]
 * ```
 */
export type RGBColor = [number, number, number]

/**
 * Default CLI title constant
 *
 * Default chart title used when no custom title is provided.
 * Provides a fallback title for chart display.
 *
 * @example
 * ```typescript
 * import { DEFAULT_TITLE } from '@/cli/types'
 *
 * const title = options.title || DEFAULT_TITLE
 * console.log(`Chart: ${title}`)
 * ```
 */
export const DEFAULT_TITLE = 'Candlestick Chart'
