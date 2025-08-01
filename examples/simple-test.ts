import ccxt from 'ccxt'
import { Chart } from '@/chart'
import { fnum } from '@/utils'
import { MarketDataError, ChartRenderError, ValidationError } from '@/types/errors'
import { CCXTProvider } from '@core/ccxt'
import type { Candles } from '@/types/candlestick'
import { EXAMPLE_CONFIG } from './shared'

// Global configuration
const GLOBAL_CONFIG = {
  // Colors (using shared constants)
  BEAR_COLOR: EXAMPLE_CONFIG.BEAR_COLOR,
  BULL_COLOR: EXAMPLE_CONFIG.BULL_COLOR,
  VOL_BEAR_COLOR: EXAMPLE_CONFIG.BEAR_COLOR,
  VOL_BULL_COLOR: EXAMPLE_CONFIG.BULL_COLOR,

  // Trading settings
  SYMBOL: 'BTC/USDT:USDT',
  TIMEFRAME: '4h',
  LIMIT: EXAMPLE_CONFIG.MAX_CANDLES,

  // Chart settings
  VOLUME_HEIGHT: EXAMPLE_CONFIG.VOLUME_HEIGHT,
  MARGINS: { top: 2, right: 2, bottom: 1, left: 0 }
} as const

/**
 * Enhanced candlestick chart demonstration
 *
 * Demonstrates comprehensive usage of the Candlestick-CLI library with
 * real-time market data, multiple chart configurations, and proper error handling.
 * Now supports perpetual futures and expanded timeframe options.
 *
 * @example
 * ```bash
 * npm run example
 * ```
 */
async function main(): Promise<void> {
  try {
    await demonstrateLiveMarketData()
    await demonstrateChartConfigurations()
    await demonstrateAdvancedFeatures()
  } catch (error) {
    handleError(error)
  }
}

/**
 * Demonstrate live market data fetching and basic chart rendering
 */
async function demonstrateLiveMarketData(): Promise<void> {
  console.log('=== Live Market Data Demonstration ===')

  // Initialize exchange for perpetual futures
  const exchange = new ccxt.binance({
    apiKey: '',
    secret: '',
    sandbox: false,
    options: {
      defaultType: 'future'
    }
  })

  // Fetch perpetual futures OHLCV data with global config
  const symbol = GLOBAL_CONFIG.SYMBOL
  const timeframe = GLOBAL_CONFIG.TIMEFRAME
  const limit = GLOBAL_CONFIG.LIMIT

  console.log(`Fetching ${limit} ${timeframe} perpetual futures candles for ${symbol}...`)

  const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
  const candles = convertToCandleFormat(ohlcv)

  // Create and configure chart with global settings
  const chart = new Chart(candles, {
    title: `${symbol} ${timeframe} Auto-Resize Chart`
  })

  // Apply global configuration
  configureChartColors(chart)
  configureChartHighlights(chart)
  configureChartDisplay(chart)

  // Enable auto-resize for responsive behavior
  chart.enableAutoResize()

  chart.draw()
}

/**
 * Demonstrate different chart configurations and scaling modes
 */
async function demonstrateChartConfigurations(): Promise<void> {
  console.log('\n=== Chart Configuration Examples ===')

  const exchange = new ccxt.binance({
    apiKey: '',
    secret: '',
    sandbox: false,
    options: {
      defaultType: 'future'
    }
  })

  const symbol = GLOBAL_CONFIG.SYMBOL
  const timeframe = GLOBAL_CONFIG.TIMEFRAME
  const limit = GLOBAL_CONFIG.LIMIT

  const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
  const candles = convertToCandleFormat(ohlcv)

  // Example 1: Fixed time range (zoom to last 50 candles)
  console.log('\n--- Fixed Time Range Chart (Last 50 candles) ---')
  const fixedRangeChart = new Chart(candles, {
    title: `${symbol} ${timeframe} Fixed Range Chart`
  })

  configureChartColors(fixedRangeChart)
  fixedRangeChart.setName(symbol)
  fixedRangeChart.setVolumePaneEnabled(true)
  fixedRangeChart.setVolumePaneHeight(5)
  fixedRangeChart.setMargins(1, 1, 1, 0)
  fixedRangeChart.setScalingMode('fixed')
  fixedRangeChart.setTimeRange(candles.length - 50, candles.length - 1)
  fixedRangeChart.draw()

  // Example 2: Compact margins for space-constrained environments
  console.log('\n--- Compact Margins Chart ---')
  const compactChart = new Chart(candles, {
    title: `${symbol} ${timeframe} Compact Chart`
  })

  configureChartColors(compactChart)
  compactChart.setName(symbol)
  compactChart.setVolumePaneEnabled(true)
  compactChart.setVolumePaneHeight(3)
  compactChart.setMargins(0, 1, 0, 0)
  compactChart.setScalingMode('fit')
  compactChart.fitToData()
  compactChart.draw()

  // Example 3: Price-based scaling with custom range
  console.log('\n--- Price Range Chart ---')
  const priceRangeChart = new Chart(candles, {
    title: `${symbol} ${timeframe} Price Range Chart`
  })

  configureChartColors(priceRangeChart)
  priceRangeChart.setName(symbol)
  priceRangeChart.setVolumePaneEnabled(true)
  priceRangeChart.setVolumePaneHeight(4)
  priceRangeChart.setMargins(2, 2, 1, 0)
  priceRangeChart.setScalingMode('price')

  // Set price range based on data statistics
  const stats = priceRangeChart.chartData.visibleCandleSet.getStats()
  const priceRange = stats.maxPrice - stats.minPrice
  const midPrice = stats.minPrice + priceRange / 2
  const range = priceRange * 0.8 // 80% of the range

  priceRangeChart.setPriceRange(midPrice - range / 2, midPrice + range / 2)
  priceRangeChart.draw()
}

/**
 * Demonstrate advanced features like auto-resize and custom styling
 */
async function demonstrateAdvancedFeatures(): Promise<void> {
  console.log('\n=== Advanced Features Demonstration ===')

  const exchange = new ccxt.binance({
    apiKey: '',
    secret: '',
    sandbox: false,
    options: {
      defaultType: 'future'
    }
  })

  // Create chart with different symbol for variety
  const symbol = GLOBAL_CONFIG.SYMBOL // Use global config
  const timeframe = GLOBAL_CONFIG.TIMEFRAME
  const limit = GLOBAL_CONFIG.LIMIT

  const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
  const candles = convertToCandleFormat(ohlcv)

  // Advanced chart with custom styling and auto-resize
  console.log('\n--- Advanced Chart with Auto-Resize ---')
  const advancedChart = new Chart(candles, {
    title: `${symbol} ${timeframe} Advanced Chart`
  })

  // Custom color scheme
  advancedChart.setBearColor(255, 107, 107) // Custom red
  advancedChart.setBullColor(81, 207, 102) // Custom green
  advancedChart.setVolBearColor(255, 150, 150) // Light red for volume
  advancedChart.setVolBullColor(150, 255, 150) // Light green for volume

  advancedChart.setName(symbol)
  advancedChart.setVolumePaneEnabled(true)
  advancedChart.setVolumePaneHeight(8)
  advancedChart.setMargins(3, 3, 2, 1)

  // Advanced highlighting
  const stats = advancedChart.chartData.visibleCandleSet.getStats()
  const topPrice = fnum(stats.maxPrice)
  const bottomPrice = fnum(stats.minPrice)
  const lastPrice = fnum(stats.lastPrice)
  const avgPrice = fnum(stats.average)

  advancedChart.setHighlight(topPrice, [0, 255, 0]) // Green for highest
  advancedChart.setHighlight(bottomPrice, [255, 0, 0]) // Red for lowest
  advancedChart.setHighlight(lastPrice, [255, 255, 0]) // Yellow for current
  advancedChart.setHighlight(avgPrice, [0, 255, 255]) // Cyan for average

  advancedChart.setScalingMode('fit')
  advancedChart.fitToData()

  // Enable auto-resize for responsive behavior
  advancedChart.enableAutoResize(2000) // Check every 2 seconds

  advancedChart.draw()

  // Demonstrate CCXTProvider usage
  console.log('\n--- CCXTProvider Example ---')
  await demonstrateCCXTProvider()
}

/**
 * Demonstrate CCXTProvider usage for cleaner data fetching
 */
async function demonstrateCCXTProvider(): Promise<void> {
  try {
    const provider = new CCXTProvider()

    // Fetch data using the provider
    const data = await provider.fetch4H('BTC/USDT', 300)
    const currentPrice = await provider.getLatestPrice('BTC/USDT')

    console.log(`Current BTC price: $${currentPrice}`)

    const providerChart = new Chart(data, {
      title: 'BTC/USDT 4H via CCXTProvider'
    })

    configureChartColors(providerChart)
    providerChart.setName('BTC/USDT')
    providerChart.setVolumePaneEnabled(true)
    providerChart.setVolumePaneHeight(4)
    providerChart.setMargins(2, 2, 1, 0)
    providerChart.setScalingMode('fit')
    providerChart.fitToData()
    providerChart.draw()
  } catch (error) {
    console.error('CCXTProvider demonstration failed:', error)
  }
}

/**
 * Convert CCXT OHLCV data to internal candle format
 */
function convertToCandleFormat(ohlcv: unknown[]): Candles {
  return ohlcv.map(candle => {
    const [timestamp, open, high, low, close, volume] = candle as [number, number, number, number, number, number]
    return {
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
      timestamp: Number(timestamp),
      type: Number(open) < Number(close) ? 1 : 0
    }
  })
}

/**
 * Configure standard chart colors
 */
function configureChartColors(chart: Chart): void {
  // Use global color configuration
  chart.setBearColor(...GLOBAL_CONFIG.BEAR_COLOR)
  chart.setBullColor(...GLOBAL_CONFIG.BULL_COLOR)
  chart.setVolBearColor(...GLOBAL_CONFIG.VOL_BEAR_COLOR)
  chart.setVolBullColor(...GLOBAL_CONFIG.VOL_BULL_COLOR)
}

/**
 * Configure chart highlights based on statistics
 */
function configureChartHighlights(chart: Chart): void {
  const visibleStats = chart.chartData.visibleCandleSet.getStats()

  const topPrice = fnum(visibleStats.maxPrice)
  const bottomPrice = fnum(visibleStats.minPrice)
  const lastPrice = fnum(visibleStats.lastPrice)

  chart.setHighlight(topPrice, 'green')
  chart.setHighlight(bottomPrice, 'red')
  chart.setHighlight(lastPrice, 'yellow')
}

/**
 * Configure standard chart display settings
 */
function configureChartDisplay(chart: Chart): void {
  chart.setVolumePaneEnabled(true)
  chart.setVolumePaneHeight(GLOBAL_CONFIG.VOLUME_HEIGHT)
  chart.setMargins(
    GLOBAL_CONFIG.MARGINS.top,
    GLOBAL_CONFIG.MARGINS.right,
    GLOBAL_CONFIG.MARGINS.bottom,
    GLOBAL_CONFIG.MARGINS.left
  )
  chart.setScalingMode('fit')
  chart.fitToData()
}

/**
 * Handle errors with proper categorization and logging
 */
function handleError(error: unknown): void {
  if (error instanceof MarketDataError) {
    console.error('❌ Market Data Error:', error.message)
    console.error('Symbol:', error.symbol)
    console.error('Timeframe:', error.timeframe)
  } else if (error instanceof ChartRenderError) {
    console.error('❌ Chart Render Error:', error.message)
    console.error('Chart ID:', error.chartId)
  } else if (error instanceof ValidationError) {
    console.error('❌ Validation Error:', error.message)
    console.error('Field:', error.field)
  } else {
    console.error('❌ Unexpected Error:', error)
  }

  process.exit(1)
}

// Execute the demonstration
main().catch(handleError)
