import { readFileSync } from 'fs'
import { join } from 'path'
import { parseCandlesFromCsv, parseCandlesFromJson } from '@/utils/core'
import type { CliOptions } from './types'
import type { Candles } from '@/types/candlestick'
import { validateFile } from './validation'

// Node.js global declarations
declare const process: {
  cwd(): string
}

/**
 * Process and parse file data
 *
 * Reads file content and parses it into candle data based on file format.
 * Supports CSV and JSON formats with error handling.
 *
 * @param options - CLI options containing file path
 * @returns Array of parsed candle objects
 * @throws Error if file cannot be read or parsed
 *
 * @example
 * ```typescript
 * const options = { file: 'data.csv' }
 * const candles = processFile(options)
 * console.log(candles.length) // Number of candles
 * ```
 */
export function processFile(options: CliOptions): Candles {
  if (!options.file) {
    throw new Error('File path is required')
  }

  const filePath = options.file.startsWith('/') ? options.file : join(process.cwd(), options.file)
  validateFile(filePath)
  const fileContent = readFileSync(filePath, 'utf-8')

  if (options.file.endsWith('.csv')) {
    return parseCandlesFromCsv(fileContent)
  } else if (options.file.endsWith('.json')) {
    return parseCandlesFromJson(fileContent)
  }

  throw new Error('Unsupported file format')
}

/**
 * Fetch live market data using CCXT
 *
 * Fetches real-time market data from cryptocurrency exchanges using the CCXT library.
 * Converts exchange data to internal candle format for chart rendering.
 *
 * @param symbol - Trading symbol (e.g., BTC/USDT)
 * @param timeframe - Time interval (1h, 4h, 1d)
 * @param limit - Number of candles to fetch
 * @returns Array of market data in candle format
 * @throws Error if data fetching fails
 *
 * @example
 * ```typescript
 * const candles = await fetchLiveData('BTC/USDT', '1h', 100)
 * console.log(`Fetched ${candles.length} candles`)
 * ```
 */
export async function fetchLiveData(symbol: string, timeframe: string, limit: number): Promise<Candles> {
  const { CCXTProvider } = await import('@/core/ccxt')
  const provider = new CCXTProvider()
  const data = await provider.fetchOHLCV(symbol, timeframe, limit)
  return data.map(item => ({
    ...item,
    volume: item.volume || 0
  }))
}

/**
 * Fetch data from appropriate source
 *
 * Retrieves candle data from file or live market source based on CLI options.
 * Supports both file-based data (CSV/JSON) and live market data via CCXT.
 * Automatically sets default chart title for live data sources.
 *
 * @param options - CLI options containing data source information
 * @returns Array of candle data in standardized format
 * @throws Error if no valid data source is specified
 *
 * @example
 * ```typescript
 * const candles = await fetchData({ file: 'data.csv' })
 * const liveCandles = await fetchData({ symbol: 'BTC/USDT', timeframe: '1h' })
 * ```
 */
export async function fetchData(options: CliOptions): Promise<Candles> {
  if (options.file) {
    return processFile(options)
  }
  if (options.symbol) {
    const { validateLiveDataOptions } = await import('./validation')
    validateLiveDataOptions(options.symbol, options.timeframe!, options.limit!)
    const candles = await fetchLiveData(options.symbol, options.timeframe!, options.limit!)
    if (!options.title || options.title === 'Candlestick Chart') {
      options.title = `${options.symbol} ${options.timeframe?.toUpperCase()} Chart`
    }
    return candles
  }
  throw new Error('No data source specified')
}
