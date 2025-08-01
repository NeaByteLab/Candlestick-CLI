import * as ccxt from 'ccxt'
import { MarketDataError } from '@/types/errors'
import type { MarketData } from '@/types/index'

/**
 * CCXT Market Data Provider
 *
 * Fetches real market data from cryptocurrency exchanges using the CCXT library.
 * Supports multiple timeframes (1H, 4H, 1D) with comprehensive error handling
 * and rate limiting. Provides clean, validated OHLCV data for chart rendering.
 *
 * @example
 * ```typescript
 * import { CCXTProvider } from '@/core/ccxt'
 *
 * const provider = new CCXTProvider()
 * const data = await provider.fetch4H('BTC/USDT', 100)
 * const price = await provider.getLatestPrice('BTC/USDT')
 * ```
 */
export class CCXTProvider {
  private exchange: ccxt.binance

  /**
   * Initialize CCXT provider with Binance exchange
   *
   * Creates a new CCXT provider instance configured for Binance futures trading
   * with rate limiting enabled and default futures market type.
   *
   * @example
   * ```typescript
   * const provider = new CCXTProvider()
   * ```
   */
  constructor() {
    this.exchange = new ccxt.binance({
      enableRateLimit: true,
      options: {
        defaultType: 'future'
      }
    })
  }

  /**
   * Fetch OHLCV data from cryptocurrency exchange
   *
   * Retrieves historical candlestick data from the configured exchange with
   * comprehensive validation and error handling. Supports all standard timeframes
   * and automatically validates OHLC relationships.
   *
   * @param symbol - Trading pair symbol (default: 'BTC/USDT')
   * @param timeframe - Time interval (default: '1h')
   * @param limit - Number of data points to fetch (default: 1000)
   * @returns Array of market data with OHLCV values
   * @throws MarketDataError if fetching fails or data is invalid
   *
   * @example
   * ```typescript
   * const data = await provider.fetchOHLCV('BTC/USDT', '4h', 500)
   * console.log(`Fetched ${data.length} candles`)
   * ```
   */
  async fetchOHLCV(symbol: string = 'BTC/USDT', timeframe: string = '1h', limit: number = 1000): Promise<MarketData[]> {
    try {
      this.validateInputs(symbol, timeframe, limit)
      await this.exchange.loadMarkets()
      const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
      this.validateOHLCVData(ohlcv, symbol, timeframe)
      return this.processOHLCVData(ohlcv, symbol, timeframe)
    } catch (error) {
      this.handleFetchError(error, symbol, timeframe)
    }
  }

  /**
   * Validate input parameters for data fetching
   *
   * Ensures all input parameters meet requirements before making API calls.
   * Validates symbol format, timeframe validity, and limit constraints.
   *
   * @param symbol - Trading pair symbol to validate
   * @param timeframe - Timeframe string to validate
   * @param limit - Number of data points to validate
   * @throws MarketDataError if any parameter is invalid
   *
   * @example
   * ```typescript
   * this.validateInputs('BTC/USDT', '4h', 500)
   * ```
   */
  private validateInputs(symbol: string, timeframe: string, limit: number): void {
    if (!symbol || typeof symbol !== 'string') {
      throw new MarketDataError('Invalid symbol provided', symbol, timeframe)
    }
    if (!timeframe || typeof timeframe !== 'string') {
      throw new MarketDataError('Invalid timeframe provided', symbol, timeframe)
    }
    if (typeof limit !== 'number' || limit <= 0 || limit > 10000) {
      throw new MarketDataError(`Invalid limit provided: ${limit}. Must be between 1 and 10000`, symbol, timeframe)
    }
  }

  /**
   * Validate OHLCV data structure from exchange
   *
   * Ensures the received OHLCV data is properly structured and contains
   * valid data before processing. Checks for array format and non-empty results.
   *
   * @param ohlcv - Raw OHLCV data from exchange
   * @param symbol - Trading pair symbol for error context
   * @param timeframe - Timeframe for error context
   * @throws MarketDataError if data structure is invalid
   *
   * @example
   * ```typescript
   * this.validateOHLCVData(ohlcvData, 'BTC/USDT', '4h')
   * ```
   */
  private validateOHLCVData(ohlcv: unknown, symbol: string, timeframe: string): void {
    if (!Array.isArray(ohlcv) || ohlcv.length === 0) {
      throw new MarketDataError('No market data received from exchange', symbol, timeframe)
    }
  }

  /**
   * Process and convert raw OHLCV data to MarketData format
   *
   * Transforms raw exchange OHLCV data into standardized MarketData objects
   * with proper type conversion and validation of OHLC relationships.
   *
   * @param ohlcv - Raw OHLCV data array from exchange
   * @param symbol - Trading pair symbol for error context
   * @param timeframe - Timeframe for error context
   * @returns Array of processed MarketData objects
   * @throws MarketDataError if data processing fails
   *
   * @example
   * ```typescript
   * const marketData = this.processOHLCVData(rawData, 'BTC/USDT', '4h')
   * ```
   */
  private processOHLCVData(ohlcv: unknown[], symbol: string, timeframe: string): MarketData[] {
    return ohlcv.map((item, index) => {
      const [timestamp, open, high, low, close, volume] = item as [unknown, unknown, unknown, unknown, unknown, unknown]
      const data: MarketData = {
        timestamp: Number(timestamp) || 0,
        open: Number(open) || 0,
        high: Number(high) || 0,
        low: Number(low) || 0,
        close: Number(close) || 0,
        volume: Number(volume) || 0
      }
      this.validateOHLCData(data, index, symbol, timeframe)
      return data
    })
  }

  /**
   * Validate OHLC data relationships
   *
   * Ensures each candle's OHLC values follow logical relationships:
   * - High must be >= max(open, close)
   * - Low must be <= min(open, close)
   *
   * @param data - MarketData object to validate
   * @param index - Index of the candle for error reporting
   * @param symbol - Trading pair symbol for error context
   * @param timeframe - Timeframe for error context
   * @throws MarketDataError if OHLC relationships are invalid
   *
   * @example
   * ```typescript
   * this.validateOHLCData(candleData, 0, 'BTC/USDT', '4h')
   * ```
   */
  private validateOHLCData(data: MarketData, index: number, symbol: string, timeframe: string): void {
    if (data.high < Math.max(data.open, data.close)) {
      throw new MarketDataError(`Invalid OHLC data at index ${index}: high < max(open, close)`, symbol, timeframe)
    }
    if (data.low > Math.min(data.open, data.close)) {
      throw new MarketDataError(`Invalid OHLC data at index ${index}: low > min(open, close)`, symbol, timeframe)
    }
  }

  /**
   * Handle and categorize fetch errors
   *
   * Processes errors from data fetching operations and categorizes them
   * into specific error types for better error handling and user feedback.
   *
   * @param error - Error object from fetch operation
   * @param symbol - Trading pair symbol for error context
   * @param timeframe - Timeframe for error context
   * @throws MarketDataError with categorized error message
   *
   * @example
   * ```typescript
   * this.handleFetchError(fetchError, 'BTC/USDT', '4h')
   * ```
   */
  private handleFetchError(error: unknown, symbol: string, timeframe: string): never {
    if (error instanceof MarketDataError) {
      throw error
    }
    if (error instanceof Error) {
      this.handleSpecificError(error, symbol, timeframe)
    }
    throw new MarketDataError(
      `Failed to fetch market data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      symbol,
      timeframe
    )
  }

  /**
   * Handle specific error types with detailed messages
   *
   * Categorizes common exchange errors and provides user-friendly error messages
   * for different error scenarios like invalid symbols, timeframes, rate limits, etc.
   *
   * @param error - Error object to categorize
   * @param symbol - Trading pair symbol for error context
   * @param timeframe - Timeframe for error context
   * @throws MarketDataError with specific error message
   *
   * @example
   * ```typescript
   * this.handleSpecificError(apiError, 'BTC/USDT', '4h')
   * ```
   */
  private handleSpecificError(error: Error, symbol: string, timeframe: string): never {
    if (error.message.includes('symbol')) {
      throw new MarketDataError(`Invalid symbol: ${symbol}`, symbol, timeframe)
    }
    if (error.message.includes('timeframe')) {
      throw new MarketDataError(`Invalid timeframe: ${timeframe}`, symbol, timeframe)
    }
    if (error.message.includes('rate limit')) {
      throw new MarketDataError('Rate limit exceeded, please try again later', symbol, timeframe)
    }
    if (error.message.includes('network')) {
      throw new MarketDataError('Network error, please check your connection', symbol, timeframe)
    }
    throw new MarketDataError(`Failed to fetch market data: ${error.message}`, symbol, timeframe)
  }

  /**
   * Fetch 4-hour timeframe data
   *
   * Convenience method for fetching 4-hour candlestick data with optimized
   * default parameters for 4H timeframe analysis.
   *
   * @param symbol - Trading pair symbol (default: 'BTC/USDT')
   * @param limit - Number of data points to fetch (default: 500)
   * @returns Array of 4H market data
   * @throws MarketDataError if fetching fails
   *
   * @example
   * ```typescript
   * const fourHourData = await provider.fetch4H('BTC/USDT', 200)
   * console.log(`Fetched ${fourHourData.length} 4H candles`)
   * ```
   */
  async fetch4H(symbol: string = 'BTC/USDT', limit: number = 500): Promise<MarketData[]> {
    return this.fetchOHLCV(symbol, '4h', limit)
  }

  /**
   * Fetch 1-day timeframe data
   *
   * Convenience method for fetching daily candlestick data with optimized
   * default parameters for daily timeframe analysis.
   *
   * @param symbol - Trading pair symbol (default: 'BTC/USDT')
   * @param limit - Number of data points to fetch (default: 200)
   * @returns Array of 1D market data
   * @throws MarketDataError if fetching fails
   *
   * @example
   * ```typescript
   * const dailyData = await provider.fetch1D('BTC/USDT', 100)
   * console.log(`Fetched ${dailyData.length} daily candles`)
   * ```
   */
  async fetch1D(symbol: string = 'BTC/USDT', limit: number = 200): Promise<MarketData[]> {
    return this.fetchOHLCV(symbol, '1d', limit)
  }

  /**
   * Get latest price for trading pair
   *
   * Fetches the most recent price for a trading pair using the exchange's
   * ticker API. Returns the last traded price or 0 if unavailable.
   *
   * @param symbol - Trading pair symbol (default: 'BTC/USDT')
   * @returns Latest price value
   * @throws Error if price fetching fails
   *
   * @example
   * ```typescript
   * const currentPrice = await provider.getLatestPrice('BTC/USDT')
   * console.log(`Current BTC price: $${currentPrice}`)
   * ```
   */
  async getLatestPrice(symbol: string = 'BTC/USDT'): Promise<number> {
    try {
      const ticker = await this.exchange.fetchTicker(symbol)
      return ticker.last || 0
    } catch (error) {
      globalThis.console.error('Error fetching latest price:', error)
      throw error
    }
  }

  /**
   * Get market information for trading pair
   *
   * Retrieves detailed market information including precision, limits, and
   * trading parameters for the specified trading pair.
   *
   * @param symbol - Trading pair symbol (default: 'BTC/USDT')
   * @returns Market information object with symbol, base, quote, precision, and limits
   * @throws Error if market info fetching fails
   *
   * @example
   * ```typescript
   * const marketInfo = await provider.getMarketInfo('BTC/USDT')
   * console.log(`Base: ${marketInfo.base}, Quote: ${marketInfo.quote}`)
   * ```
   */
  async getMarketInfo(symbol: string = 'BTC/USDT'): Promise<{
    symbol: string
    base: string
    quote: string
    precision: Record<string, unknown>
    limits: Record<string, unknown>
  }> {
    try {
      await this.exchange.loadMarkets()
      const market = this.exchange.market(symbol)
      return {
        symbol: market.symbol,
        base: market.base,
        quote: market.quote,
        precision: market.precision,
        limits: market.limits
      }
    } catch (error) {
      globalThis.console.error('Error fetching market info:', error)
      throw error
    }
  }
}
