import figlet from 'figlet'
import type { CliOptions } from './types'
import type { Chart } from '@/chart/chart'
import type { ExportOptions } from '@/types/candlestick'

// Node.js global declarations
declare const console: Console

/**
 * Display ASCII art header using figlet
 *
 * Creates an ASCII art banner for the CLI application
 * using the figlet library with custom styling.
 *
 * @example
 * ```typescript
 * showAsciiHeader() // Displays ASCII banner
 * ```
 */
export function showAsciiHeader(): void {
  const banner = figlet.textSync('Candlestick-CLI', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  })
  console.log(banner)
}

/**
 * Handle chart export or display
 *
 * Exports chart to file if output path specified, otherwise displays in terminal.
 * Supports PNG image export and TXT text export with customizable options.
 * Automatically detects export format from file extension.
 *
 * @param chart - Configured chart instance
 * @param options - CLI options for export configuration
 * @throws Error if export fails or format is unsupported
 *
 * @example
 * ```typescript
 * await handleChartOutput(chart, { output: 'chart.png', scale: 2 })
 * await handleChartOutput(chart, { output: 'chart.txt' })
 * ```
 */
export async function handleChartOutput(chart: Chart, options: CliOptions): Promise<void> {
  if (options.output) {
    const { exportToText, exportToImage } = await import('@/utils/export')
    const exportOptions: Partial<ExportOptions> = {}
    if (options.scale !== undefined) {
      exportOptions.scale = options.scale
    }
    if (options.background !== undefined) {
      exportOptions.background = options.background
    }
    const ext = options.output.toLowerCase()
    if (ext.endsWith('.txt')) {
      await exportToText(chart, options.output, false)
    } else if (ext.endsWith('.png')) {
      await exportToImage(chart, { ...exportOptions, outputPath: options.output })
    } else {
      throw new Error(`Unsupported export format: ${ext}. Use .txt or .png`)
    }
  } else {
    showAsciiHeader()
    chart.draw()
  }
}
