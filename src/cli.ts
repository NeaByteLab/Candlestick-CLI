#!/usr/bin/env node

import { Chart } from '@/chart/chart'
import { parseCandlesFromCsv, parseCandlesFromJson } from '@/utils/core'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import figlet from 'figlet'

// Global types for Node.js environment
declare const process: any
declare const console: any

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
interface CliOptions {
  /** Path to CSV or JSON file containing candle data */
  file: string
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
}

/**
 * Parse command-line arguments into structured options
 *
 * Processes command-line arguments and converts them into a structured
 * CliOptions object. Handles both short and long option formats.
 *
 * @returns Parsed CLI options object
 *
 * @example
 * ```typescript
 * const options = parseArgs()
 * console.log(options.file) // 'data.csv'
 * console.log(options.title) // 'BTC/USDT'
 * ```
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    file: '',
    title: 'Candlestick Chart',
    width: 0,
    height: 0,
    volume: true,
    volumeHeight: 5
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]
    if (arg === '--help') {
      showHelp()
      process.exit(0)
    }
    if (arg === '--no-volume') {
      options.volume = false
      continue
    }
    if (!nextArg) {
      continue
    }
    switch (arg) {
      case '--file':
      case '-f':
        options.file = nextArg
        break
      case '--title':
      case '-t':
        options.title = nextArg
        break
      case '--width':
      case '-w':
        options.width = parseInt(nextArg)
        break
      case '--height':
      case '-h':
        options.height = parseInt(nextArg)
        break
      case '--bear-color':
        options.bearColor = nextArg
        break
      case '--bull-color':
        options.bullColor = nextArg
        break
      case '--volume-height':
        options.volumeHeight = parseInt(nextArg)
        break
    }
    i++
  }
  return options
}

/**
 * Display help information and usage examples
 *
 * Shows comprehensive help information including all available options,
 * usage examples, file format specifications, and limits.
 * Exits the process after displaying help.
 */
function showHelp(): void {
  console.log(`
Candlestick-CLI - Terminal candlestick chart viewer

Usage: candlestick-cli [options]

Options:
  -f, --file <path>           Path to CSV or JSON file
  -t, --title <title>         Chart title (default: "Candlestick Chart")
  -w, --width <number>        Chart width (0 for auto)
  -h, --height <number>       Chart height (0 for auto)
  --bear-color <color>        Bearish candle color (hex or RGB)
  --bull-color <color>        Bullish candle color (hex or RGB)
  --no-volume                 Disable volume pane
  --volume-height <number>    Volume pane height (default: 5)
  --help                      Show this help

Examples:
  candlestick-cli -f data.csv -t "BTC/USDT"
  candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"
  candlestick-cli -f data.csv --no-volume --width 120 --height 30

File Formats:
  CSV: Should have columns: open,high,low,close,volume,timestamp
  JSON: Array of objects with: open,high,low,close,volume,timestamp

Limits:
  Minimum: 5 candles, Maximum: 10,000 candles
`)
}

/**
 * Display ASCII art header using figlet
 *
 * Creates a decorative ASCII art banner for the CLI application
 * using the figlet library with custom styling.
 */
function showAsciiHeader(): void {
  const banner = figlet.textSync('Candlestick-CLI', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  })
  console.log(banner)
}

/**
 * Parse color string into RGB values
 *
 * Converts color strings in various formats (hex, RGB) into
 * RGB tuple values for use in chart coloring.
 *
 * @param color - Color string in hex (#ff0000) or RGB (255,0,0) format
 * @returns RGB tuple [r, g, b] or undefined if parsing fails
 *
 * @example
 * ```typescript
 * parseColor('#ff0000')  // [255, 0, 0]
 * parseColor('255,0,0')  // [255, 0, 0]
 * parseColor('invalid')  // undefined
 * ```
 */
function parseColor(color: string): [number, number, number] | undefined {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return [r, g, b]
  }
  if (color.includes(',')) {
    const [r, g, b] = color.split(',').map(x => parseInt(x.trim()))
    return [r, g, b]
  }
  return undefined
}

/**
 * Validate file path and format
 *
 * Checks if the provided file path exists and has a supported format.
 * Throws descriptive errors for invalid files.
 *
 * @param filePath - Path to the file to validate
 * @throws Error if file path is missing, format is unsupported, or file doesn't exist
 *
 * @example
 * ```typescript
 * validateFile('data.csv')     // Valid
 * validateFile('data.txt')     // Error: Unsupported format
 * validateFile('nonexistent.csv') // Error: File not found
 * ```
 */
function validateFile(filePath: string): void {
  if (!filePath) {
    throw new Error('File path is required. Use --file or -f option.')
  }
  if (!filePath.endsWith('.csv') && !filePath.endsWith('.json')) {
    throw new Error('Unsupported file format. Use .csv or .json files.')
  }
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
}

/**
 * Validate required candle fields
 *
 * Checks that a candle object has all required numeric fields
 * with valid values.
 *
 * @param candle - Candle object to validate
 * @param index - Index of the candle for error reporting
 * @throws Error if required fields are missing or invalid
 */
function validateCandleFields(candle: any, index: number): void {
  const requiredFields = ['open', 'high', 'low', 'close']
  for (const field of requiredFields) {
    if (typeof candle[field] !== 'number' || isNaN(candle[field])) {
      throw new Error(`Invalid ${field} value at candle ${index + 1}: ${candle[field]}`)
    }
  }
}

/**
 * Validate OHLC (Open, High, Low, Close) relationships
 *
 * Ensures that OHLC values follow proper candlestick logic:
 * - High must be >= Low
 * - All prices must be non-negative
 *
 * @param candle - Candle object to validate
 * @param index - Index of the candle for error reporting
 * @throws Error if OHLC relationships are invalid
 */
function validateCandleOHLC(candle: any, index: number): void {
  if (candle.high < candle.low) {
    throw new Error(`Invalid OHLC at candle ${index + 1}: high (${candle.high}) cannot be less than low (${candle.low})`)
  }
  if (candle.open < 0 || candle.high < 0 || candle.low < 0 || candle.close < 0) {
    throw new Error(`Invalid negative price at candle ${index + 1}`)
  }
}

/**
 * Validate candle volume data
 *
 * Checks that volume data (if present) is valid and non-negative.
 * Volume is optional but must be valid when provided.
 *
 * @param candle - Candle object to validate
 * @param index - Index of the candle for error reporting
 * @throws Error if volume data is invalid
 */
function validateCandleVolume(candle: any, index: number): void {
  if (candle.volume !== undefined) {
    if (typeof candle.volume !== 'number' || isNaN(candle.volume)) {
      throw new Error(`Invalid volume value at candle ${index + 1}: ${candle.volume}`)
    }
    if (candle.volume < 0) {
      throw new Error(`Invalid negative volume at candle ${index + 1}`)
    }
  }
}

/**
 * Validate complete candle dataset
 *
 * Performs comprehensive validation on an array of candles,
 * checking all required fields, OHLC relationships, and volume data.
 *
 * @param candles - Array of candle objects to validate
 * @throws Error if any candle data is invalid
 *
 * @example
 * ```typescript
 * const candles = [
 *   { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: 1640995200000 }
 * ]
 * validateData(candles) // Valid
 * ```
 */
function validateData(candles: any[]): void {
  if (!candles || candles.length === 0) {
    throw new Error('No valid candle data found in file.')
  }
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i]
    validateCandleFields(candle, i)
    validateCandleOHLC(candle, i)
    validateCandleVolume(candle, i)
  }
}

/**
 * Validate and parse color string
 *
 * Validates color format and converts to RGB values.
 * Supports hex (#ff0000) and RGB (255,0,0) formats.
 *
 * @param color - Color string to validate and parse
 * @param colorName - Name of the color for error reporting
 * @returns RGB tuple [r, g, b]
 * @throws Error if color format is invalid
 *
 * @example
 * ```typescript
 * validateColor('#ff0000', 'bear')  // [255, 0, 0]
 * validateColor('255,0,0', 'bull')  // [255, 0, 0]
 * ```
 */
function validateColor(color: string, colorName: string): [number, number, number] {
  const parsedColor = parseColor(color)
  if (!parsedColor) {
    throw new Error(`Invalid ${colorName} color format: ${color}. Use hex (#ff0000) or RGB (255,0,0) format.`)
  }
  return parsedColor
}

/**
 * Validate chart dimensions
 *
 * Ensures width and height values are within acceptable ranges.
 * Zero values are allowed for auto-detection.
 *
 * @param width - Chart width to validate
 * @param height - Chart height to validate
 * @throws Error if dimensions are out of range
 */
function validateDimensions(width?: number, height?: number): void {
  if (width !== undefined && (width < 0 || width > 1000)) {
    throw new Error('Width must be between 0 and 1000')
  }
  if (height !== undefined && (height < 0 || height > 1000)) {
    throw new Error('Height must be between 0 and 1000')
  }
}

/**
 * Validate volume pane height
 *
 * Ensures volume pane height is within acceptable range.
 *
 * @param volumeHeight - Volume pane height to validate
 * @throws Error if volume height is out of range
 */
function validateVolumeHeight(volumeHeight?: number): void {
  if (volumeHeight !== undefined && (volumeHeight < 1 || volumeHeight > 20)) {
    throw new Error('Volume height must be between 1 and 20')
  }
}

/**
 * Process and parse file data
 *
 * Reads file content and parses it into candle data based on file format.
 * Supports CSV and JSON formats with comprehensive error handling.
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
function processFile(options: CliOptions): any[] {
  const filePath = options.file.startsWith('/') ? options.file : join(process.cwd(), options.file)
  validateFile(filePath)
  const fileContent = readFileSync(filePath, 'utf-8')
  let candles: any[] = []
  if (options.file.endsWith('.csv')) {
    candles = parseCandlesFromCsv(fileContent)
  } else if (options.file.endsWith('.json')) {
    candles = parseCandlesFromJson(fileContent)
  }
  return candles
}

/**
 * Configure chart with CLI options
 *
 * Creates and configures a Chart instance based on CLI options.
 * Applies colors, volume settings, and other customizations.
 *
 * @param options - CLI options for chart configuration
 * @param candles - Candle data for the chart
 * @returns Configured Chart instance
 *
 * @example
 * ```typescript
 * const options = {
 *   title: 'BTC/USDT',
 *   bearColor: '#ff6b6b',
 *   bullColor: '#51cf66',
 *   volume: true,
 *   volumeHeight: 5
 * }
 * const chart = configureChart(options, candles)
 * ```
 */
function configureChart(options: CliOptions, candles: any[]): Chart {
  const chart = new Chart(candles, {
    title: options.title || 'Candlestick Chart',
    width: options.width || 0,
    height: options.height || 0
  })
  if (options.bearColor) {
    try {
      const bearColor = validateColor(options.bearColor, 'bear')
      chart.setBearColor(...bearColor)
    } catch (error) {
      console.warn(`⚠️  Warning: ${error instanceof Error ? error.message : 'Invalid bear color'}`)
    }
  }
  if (options.bullColor) {
    try {
      const bullColor = validateColor(options.bullColor, 'bull')
      chart.setBullColor(...bullColor)
    } catch (error) {
      console.warn(`⚠️  Warning: ${error instanceof Error ? error.message : 'Invalid bull color'}`)
    }
  }
  if (options.volume) {
    chart.setVolumePaneEnabled(true)
    chart.setVolumePaneHeight(options.volumeHeight || 5)
  } else {
    chart.setVolumePaneEnabled(false)
  }
  return chart
}

/**
 * Main CLI entry point
 *
 * Orchestrates the entire CLI workflow:
 * 1. Parse command-line arguments
 * 2. Validate file and options
 * 3. Process file data
 * 4. Configure and display chart
 *
 * Handles errors gracefully with descriptive messages and help suggestions.
 *
 * @example
 * ```bash
 * candlestick-cli -- -f data.csv -t "BTC/USDT"
 * ```
 */
function main(): void {
  try {
    const options = parseArgs()
    if (!options.file) {
      console.error('❌ Error: File path is required. Use --file or -f option.')
      console.error('💡 Use --help for more information.')
      process.exit(1)
    }
    const candles = processFile(options)
    validateData(candles)
    validateDimensions(options.width, options.height)
    validateVolumeHeight(options.volumeHeight)
    const chart = configureChart(options, candles)
    showAsciiHeader()
    chart.draw()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`❌ Error: ${errorMessage}`)
    console.error('💡 Use --help for more information.')
    process.exit(1)
  }
}

main()