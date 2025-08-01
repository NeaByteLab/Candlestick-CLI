import type { CliOptions } from './types'
import { DEFAULT_TITLE } from './types'

// Node.js global declarations
declare const process: {
  argv: string[]
  exit(code?: number): never
  cwd(): string
}
declare const console: Console

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
export async function parseArgs(): Promise<CliOptions> {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    title: DEFAULT_TITLE,
    timeframe: '1h',
    limit: 1000,
    width: 0,
    height: 0,
    volume: true,
    volumeHeight: 8,
    scale: 1,
    background: 'dark',
    watch: false,
    interval: 30
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]
    if (arg === '--help') {
      await showHelp()
      process.exit(0)
    }
    if (arg === '--no-volume') {
      options.volume = false
      continue
    }
    if (arg === '--watch') {
      options.watch = true
      continue
    }
    if (arg === '--no-watch') {
      options.watch = false
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
      case '--symbol':
      case '-s':
        options.symbol = nextArg
        break
      case '--timeframe':
        options.timeframe = nextArg
        break
      case '--limit':
        options.limit = parseInt(nextArg)
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
      case '--output':
      case '-o':
        options.output = nextArg
        break
      case '--scale':
        options.scale = parseFloat(nextArg)
        break
      case '--background':
        options.background = nextArg as 'light' | 'dark'
        break
      case '--interval':
        options.interval = parseInt(nextArg)
        break
    }
    i++
  }
  return options
}

/**
 * Display help information and usage examples
 *
 * Shows help information including all available options,
 * usage examples, file format specifications, and limits.
 * Exits the process after displaying help.
 *
 * @example
 * ```typescript
 * showHelp() // Displays help and exits
 * ```
 */
async function showHelp(): Promise<void> {
  const { default: figlet } = await import('figlet')
  const banner = figlet.textSync('Candlestick-CLI', {
    font: 'Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  })
  console.log(banner)
  console.log(`
Usage: candlestick-cli [options]

Data Source Options:
  -f, --file <path>           Path to CSV or JSON file
  -s, --symbol <symbol>       Trading symbol for live data (e.g., BTC/USDT, BTC/USDT:USDT)
  --timeframe <timeframe>     Timeframe for live data (1m, 5m, 15m, 1h, 4h, 1d, 1w, 1M, default: 1h)
  --limit <number>            Number of candles to fetch (default: 1000)

Chart Options:
  -t, --title <title>         Chart title (default: "Candlestick Chart")
  -w, --width <number>        Chart width (0 for auto)
  -h, --height <number>       Chart height (0 for auto)
  --bear-color <color>        Bearish candle color (hex or RGB)
  --bull-color <color>        Bullish candle color (hex or RGB)
  --no-volume                 Disable volume pane
  --volume-height <number>    Volume pane height (default: 8)

Watch Mode (Live Data):
  --watch                     Enable watch mode for live updates
  --interval <seconds>        Update interval in seconds (default: 30)

Export Options:
  -o, --output <path>         Export chart to file (PNG, TXT)
  --scale <number>            Scale factor for image export (default: 1)
  --background <theme>        Background theme: light or dark (default: dark)

Other:
  --help                      Show this help

Examples:
  # File-based charts
  candlestick-cli -f data.csv -t "BTC/USDT"
  candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"
  
  # Live market data (single snapshot by default)
  candlestick-cli -s BTC/USDT --timeframe 4h --limit 200
  candlestick-cli -s ETH/USDT --timeframe 1d --limit 100 -t "Ethereum Daily"
  candlestick-cli -s BTC/USDT --bear-color "#a55eea" --bull-color "#feca57"
  
  # Watch mode (explicitly enabled)
  candlestick-cli -s BTC/USDT --timeframe 1h --watch
  candlestick-cli -s ETH/USDT --timeframe 15m --watch --interval 10 --limit 50
  
  # Perpetual futures
  candlestick-cli -s BTC/USDT:USDT --timeframe 1h --limit 150
  candlestick-cli -s ETH/USDT:USDT --timeframe 15m --limit 300
  
  # Export examples
  candlestick-cli -s BTC/USDT -o chart.png --scale 2 --background light
  candlestick-cli -f data.csv -o chart.txt
  candlestick-cli -s ETH/USDT -o chart.png --scale 1.5 --background dark

File Formats:
  CSV: Should have columns: open,high,low,close,volume,timestamp
  JSON: Array of objects with: open,high,low,close,volume,timestamp

Export Formats:
  PNG: High-quality image export with colors
  TXT: Plain text export

Supported Timeframes:
  1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M

Watch Mode:
  Use --watch flag to enable live updates.
  Charts update every 30 seconds (customizable with --interval).
  Press Ctrl+C to stop watching.

Note: Colors work in terminals with color support (like VSCode's integrated terminal).
If colors appear gray in your system terminal, export to PNG to see full colors.

Limits:
  Minimum: 5 candles, Maximum: 10,000 candles
`)
}
