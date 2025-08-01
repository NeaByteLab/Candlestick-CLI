#!/usr/bin/env node

// Global types for Node.js environment
declare const process: {
  argv: string[]
  exit(code?: number): never
  cwd(): string
  on(event: string, handler: () => void): void
  stdout: {
    write(data: string): boolean
  }
}
declare const console: Console
declare const setInterval: (callback: () => void, delay: number) => number

// Node.js global declarations
declare const clearInterval: (id: number) => void

import { parseArgs } from './parser'
import { validateInputSource, validateData, validateDimensions, validateVolumeHeight } from './validation'
import { fetchData } from './data'
import { configureChart } from './chart'
import { handleChartOutput } from './output'
import type { CliOptions } from './types'
import type { Chart } from '@/chart/chart'

/**
 * Display ASCII art banner
 *
 * Shows the application banner with figlet styling.
 * Used for visual branding in the CLI interface.
 *
 * @example
 * ```typescript
 * await showBanner()
 * ```
 */
async function showBanner(): Promise<void> {
  const { default: figlet } = await import('figlet')
  const banner = figlet.textSync('Candlestick-CLI', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  })
  console.log(banner)
}

/**
 * Clear console with smooth animation
 *
 * Uses ANSI escape codes to hide cursor, clear screen, and restore cursor.
 * Provides a clean visual transition for watch mode updates.
 *
 * @example
 * ```typescript
 * clearSmoothly() // Clears console smoothly
 * ```
 */
function clearSmoothly(): void {
  process.stdout.write('\x1b[?25l')
  process.stdout.write('\x1b[H\x1b[J')
  process.stdout.write('\x1b[?25h')
}

/**
 * Start watch mode for live data updates
 *
 * Runs continuous chart updates at specified intervals.
 * Handles cleanup on process termination.
 *
 * @param options - CLI configuration options
 * @param chart - Chart instance to update
 */
async function startWatchMode(options: CliOptions, chart: Chart): Promise<void> {
  const interval = (options.interval || 30) * 1000
  let updateCount = 0
  let lastUpdateTime = Date.now()
  const cleanup = (): void => {
    console.log('\n👋 Stopping watch mode...')
    process.exit(0)
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  if (options.watch && options.volumeHeight === 8) {
    chart.setVolumePaneHeight(12)
  }
  console.log(`🔄 Watch mode enabled - updating every ${options.interval || 30} seconds`)
  console.log('💡 Press Ctrl+C to stop watching')
  console.log('')
  await chart.draw()
  const updateChart = async (): Promise<void> => {
    try {
      updateCount++
      const startTime = Date.now()
      process.stdout.write(`\r🔄 Updating chart... (${updateCount})`)
      const candles = await fetchData(options)
      chart.updateCandles(candles, true)
      clearSmoothly()
      const updateTime = Date.now() - startTime
      const timeSinceLastUpdate = Date.now() - lastUpdateTime
      lastUpdateTime = Date.now()
      console.log(`📊 Chart updated in ${updateTime}ms (${timeSinceLastUpdate}ms since last update)`)
      console.log(`⏰ Next update in ${interval / 1000} seconds`)
      console.log('')
      await chart.draw()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Update failed: ${errorMessage}`)
      console.error('🔄 Retrying in next cycle...')
    }
  }
  const intervalId = setInterval(updateChart, interval)
  await new Promise<void>(resolve => {
    process.on('exit', () => {
      if (typeof clearInterval !== 'undefined') {
        clearInterval(intervalId)
      }
      resolve()
    })
  })
}

/**
 * Main CLI entry point
 *
 * Handles the complete CLI workflow:
 * 1. Parse command-line arguments
 * 2. Validate input and options
 * 3. Process data source
 * 4. Configure and display chart
 * 5. Start watch mode if enabled
 *
 * Provides error handling with descriptive messages.
 *
 * @example
 * ```bash
 * candlestick-cli -f data.csv -t "BTC/USDT"
 * candlestick-cli -s BTC/USDT --watch
 * ```
 */
async function main(): Promise<void> {
  try {
    const options = await parseArgs()
    await validateInputSource(options)
    const candles = await fetchData(options)
    validateData(candles)
    validateDimensions(options.width, options.height)
    validateVolumeHeight(options.volumeHeight)
    const chart = configureChart(options, candles)
    if (options.watch === true && options.symbol && !options.output) {
      await startWatchMode(options, chart)
    } else {
      await handleChartOutput(chart, options)
    }
  } catch (error) {
    await showBanner()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`❌ Error: ${errorMessage}`)
    console.error('💡 Use --help for more information.')
    process.exit(1)
  }
}

main().catch(async error => {
  await showBanner()
  console.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  process.exit(1)
})
