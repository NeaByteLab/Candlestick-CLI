import type { ChartConstants, ChartLabels } from '@/types/candlestick'

/**
 * Chart constants configuration
 * 
 * Defines all chart rendering constants including margins, Unicode characters,
 * formatting options, and thresholds. These constants provide comprehensive
 * chart rendering configuration.
 * 
 * @example
 * ```typescript
 * import { CONSTANTS } from '@/constants'
 * console.log(CONSTANTS.PRECISION) // 2
 * console.log(CONSTANTS.UNICODE_BODY) // "┃"
 * ```
 */
export const CONSTANTS: ChartConstants = {
  // Margins and internal sizes
  /** Top margin for chart display */
  MARGIN_TOP: 3,
  /** Right margin for chart display */
  MARGIN_RIGHT: 2,
  /** Character precision for price display */
  CHAR_PRECISION: 4,
  /** Decimal precision for price display */
  DEC_PRECISION: 2,
  /** Total width calculation: CHAR_PRECISION + 1 + DEC_PRECISION + MARGIN_RIGHT */
  WIDTH: 4 + 1 + 2 + 2,
  /** Chart height offset */
  HEIGHT: 2,
  /** Y-axis spacing between tick marks */
  Y_AXIS_SPACING: 4,

  // Numbers formatting
  /** Default precision for price formatting */
  PRECISION: 2,
  /** Small number precision for scientific notation */
  PRECISION_SMALL: 4,

  // Chart characters
  /** Unicode character for candle body */
  UNICODE_BODY: '┃',
  /** Unicode character for candle bottom */
  UNICODE_BOTTOM: '╿',
  /** Unicode character for half body bottom */
  UNICODE_HALF_BODY_BOTTOM: '╻',
  /** Unicode character for half body top */
  UNICODE_HALF_BODY_TOP: '╹',
  /** Unicode character for volume fill */
  UNICODE_FILL: '┃',
  /** Unicode character for candle top */
  UNICODE_TOP: '╽',
  /** Unicode character for empty space */
  UNICODE_VOID: ' ',
  /** Unicode character for candle wick */
  UNICODE_WICK: '│',
  /** Unicode character for lower wick */
  UNICODE_WICK_LOWER: '╵',
  /** Unicode character for upper wick */
  UNICODE_WICK_UPPER: '╷',
  /** Unicode character for Y-axis line */
  UNICODE_Y_AXIS: '│',
  /** Unicode character for Y-axis left side */
  UNICODE_Y_AXIS_LEFT: '┤',
  /** Unicode character for Y-axis right side */
  UNICODE_Y_AXIS_RIGHT: '├',

  // Thresholds
  /** Minimum difference threshold for candle rendering */
  MIN_DIFF_THRESHOLD: 0.25,
  /** Maximum difference threshold for candle rendering */
  MAX_DIFF_THRESHOLD: 0.75,

  // Chart options
  /** Whether to display Y-axis on the right side */
  Y_AXIS_ON_THE_RIGHT: false,
  /** Y-axis rounding direction */
  Y_AXIS_ROUND_DIR: 'down' as const,
  /** Y-axis rounding multiplier */
  Y_AXIS_ROUND_MULTIPLIER: 0.0
}

/**
 * Default chart labels for information display
 * 
 * These labels are used in the info bar and chart statistics display.
 * They can be customized through the Chart interface.
 * 
 * @example
 * ```typescript
 * import { LABELS } from '@/constants'
 * console.log(LABELS.price) // 'Price'
 * ```
 */
export const LABELS: ChartLabels = {
  /** Label for average price display */
  average: 'Avg.',
  /** Currency symbol (empty by default) */
  currency: '',
  /** Label for highest price display */
  highest: 'Highest',
  /** Label for lowest price display */
  lowest: 'Lowest',
  /** Label for current price display */
  price: 'Price',
  /** Label for price variation display */
  variation: 'Var.',
  /** Label for volume display */
  volume: 'Cum. Vol.'
}

/**
 * ANSI color codes for output formatting
 * 
 * Provides named color constants for consistent text coloring.
 * These colors are used throughout the chart rendering system.
 * 
 * @example
 * ```typescript
 * import { COLORS } from '@/constants'
 * console.log(COLORS.green + 'Success!' + COLORS.reset)
 * ```
 */
export const COLORS = {
  /** Blue color code */
  blue: '\x1b[94m',
  /** Bold text code */
  bold: '\x1b[01m',
  /** Cyan color code */
  cyan: '\x1b[96m',
  /** Gray color code */
  gray: '\x1b[90m',
  /** Grey color code (alias for gray) */
  grey: '\x1b[90m',
  /** Green color code */
  green: '\x1b[92m',
  /** Magenta color code */
  magenta: '\x1b[95m',
  /** Red color code */
  red: '\x1b[91m',
  /** White color code */
  white: '\x1b[97m',
  /** Yellow color code */
  yellow: '\x1b[93m'
} as const

/**
 * ANSI reset color code
 * 
 * Used to reset text colors back to default.
 * Should be used after applying any color codes.
 * 
 * @example
 * ```typescript
 * import { RESET_COLOR } from '@/constants'
 * console.log('\x1b[32mGreen text' + RESET_COLOR)
 * ```
 */
export const RESET_COLOR = '\x1b[00m'