import { CONSTANTS } from '@/constants'
import { truecolor } from '@/utils/core'
import { CandleType } from '@/types/candlestick'
import type { Candle, RGBColor } from '@/types/candlestick'

/**
 * VolumePane renders volume bars for candles
 *
 * Provides volume visualization below the main chart with colored bars
 * representing trading volume for each candle. Supports customizable colors
 * and Unicode characters for volume bar rendering.
 *
 * @example
 * ```typescript
 * import { VolumePane } from '@/chart/volume-pane'
 *
 * const volumePane = new VolumePane(6)
 * volumePane.bearishColor = [255, 100, 100] // Light red
 * volumePane.bullishColor = [100, 255, 100] // Light green
 * ```
 */
export class VolumePane {
  /** Height of the volume pane in lines */
  height: number
  /** Whether volume pane is enabled */
  enabled: boolean = true
  /** RGB color for bearish volume bars */
  bearishColor: RGBColor = [234, 74, 90]
  /** RGB color for bullish volume bars */
  bullishColor: RGBColor = [52, 208, 88]
  /** Unicode character for volume bar filling */
  unicodeFill: string = CONSTANTS.UNICODE_FILL

  /**
   * Initialize VolumePane with height
   *
   * Creates a new VolumePane instance with the specified height and
   * default color configuration. Sets up volume visualization parameters.
   *
   * @param height - Height of the volume pane in lines
   *
   * @example
   * ```typescript
   * const volumePane = new VolumePane(8) // 8-line volume pane
   * ```
   */
  constructor(height: number) {
    this.height = height
  }

  /**
   * Apply color to volume bar
   *
   * Applies the appropriate color (bullish or bearish) to volume bar characters
   * based on the candle type. Uses truecolor ANSI escape sequences for
   * precise color control.
   *
   * @param candleType - Type of candle (bullish/bearish)
   * @param string - String to colorize
   * @returns Colored string with truecolor formatting
   *
   * @example
   * ```typescript
   * const coloredBar = this.colorize(CandleType.Bullish, '┃')
   * // Returns green colored volume bar
   * ```
   */
  private colorize(candleType: CandleType, string: string): string {
    const color = candleType === CandleType.Bearish ? this.bearishColor : this.bullishColor
    return truecolor(string, ...color)
  }

  /**
   * Render volume bar for a candle
   *
   * Determines whether to render a volume bar at the given Y position based on
   * the candle's volume relative to the maximum volume. Handles optional volume
   * data and provides appropriate Unicode characters for volume visualization.
   *
   * @param candle - Candle to render volume for
   * @param y - Y coordinate in the volume pane
   * @param maxVolume - Maximum volume for scaling calculations
   * @returns Rendered volume bar string or space character
   *
   * @example
   * ```typescript
   * const volumeBar = volumePane.render(candle, 3, 1000)
   * // Returns colored volume bar or space
   * ```
   */
  render(candle: Candle, y: number, maxVolume: number): string {
    if (candle.volume === undefined) {
      return ' '
    }
    const volumePercentOfMax = candle.volume / (maxVolume || 1)
    const ratio = volumePercentOfMax * this.height
    if (y < Math.ceil(ratio)) {
      return this.colorize(candle.type, this.unicodeFill)
    }
    if (y === 1 && this.unicodeFill === CONSTANTS.UNICODE_FILL) {
      return this.colorize(candle.type, CONSTANTS.UNICODE_HALF_BODY_BOTTOM)
    }
    return ' '
  }
}
