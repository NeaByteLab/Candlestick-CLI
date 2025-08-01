# 📚 API Reference

Complete API documentation for Candlestick-CLI.

## Table of Contents

- [Chart Class](#chart-class)
- [ChartData Class](#chartdata-class)
- [ChartRenderer Class](#chartrenderer-class)
- [YAxis Class](#yaxis-class)
- [VolumePane Class](#volumepane-class)
- [InfoBar Class](#infobar-class)
- [CandleSet Class](#candleset-class)
- [CCXTProvider Class](#ccxtprovider-class)
- [Export Functions](#export-functions)
- [Utility Functions](#utility-functions)
- [Constants](#constants)
- [Error Types](#error-types)
- [Types](#types)

## Chart Class

Main chart class for creating and rendering candlestick charts.

### Constructor

```typescript
new Chart(candles: Candles, options?: ChartOptions)
```

**Parameters:**
- `candles: Candles` - Array of candle data
- `options?: ChartOptions` - Optional configuration

**ChartOptions:**
```typescript
interface ChartOptions {
  title?: string      // Chart title (default: 'My chart')
  width?: number      // Chart width (default: 0 for auto)
  height?: number     // Chart height (default: 0 for auto)
  rendererClass?: typeof ChartRenderer  // Custom renderer class
}
```

### Methods

#### Core Rendering
- `render(): Promise<string>` - Renders the chart to a string representation
- `draw(): Promise<void>` - Renders the chart to console output

#### Color Configuration
- `setBearColor(r: number, g: number, b: number): void` - Set bearish candle color (RGB values 0-255)
- `setBullColor(r: number, g: number, b: number): void` - Set bullish candle color (RGB values 0-255)
- `setVolBearColor(r: number, g: number, b: number): void` - Set volume bearish color (RGB values 0-255)
- `setVolBullColor(r: number, g: number, b: number): void` - Set volume bullish color (RGB values 0-255)

#### Volume Configuration
- `setVolumePaneEnabled(enabled: boolean): void` - Enable or disable volume pane display
- `setVolumePaneHeight(height: number): void` - Set volume pane height in lines

#### Chart Customization
- `setHighlight(price: string, color: ColorValue): void` - Highlight specific price level with color
- `setName(name: string): void` - Set chart name/title
- `setMargins(top?: number, right?: number, bottom?: number, left?: number): void` - Set chart margins

#### Data Management
- `updateCandles(candles: Candles, reset?: boolean): void` - Update chart with new candle data

#### Size Management
- `updateSize(width: number, height: number): void` - Update chart dimensions
- `updateSizeFromTerminal(): void` - Update size from current terminal dimensions
- `enableAutoResize(interval?: number): void` - Enable automatic terminal size following
- `disableAutoResize(): void` - Disable automatic terminal size following

#### Scaling Configuration
- `setScalingMode(mode: 'fit' | 'fixed' | 'price'): void` - Set chart scaling mode
- `setPriceRange(minPrice: number, maxPrice: number): void` - Set price range for price-based scaling
- `setTimeRange(startIndex: number, endIndex: number): void` - Set time range for fixed scaling
- `fitToData(): void` - Fit chart to display all data points

## CCXTProvider Class

Market data provider for fetching real-time cryptocurrency data using CCXT library.

### Constructor

```typescript
new CCXTProvider()
```

Creates a new CCXT provider instance configured for Binance futures trading.

### Methods

#### Data Fetching
- `fetchOHLCV(symbol?: string, timeframe?: string, limit?: number): Promise<Candles>` - Fetch OHLCV data from exchange
- `fetch4H(symbol?: string, limit?: number): Promise<Candles>` - Fetch 4-hour timeframe data
- `fetch1D(symbol?: string, limit?: number): Promise<Candles>` - Fetch 1-day timeframe data

#### Market Information
- `getLatestPrice(symbol?: string): Promise<number>` - Get latest price for symbol
- `getMarketInfo(symbol?: string): Promise<MarketInfo>` - Get market information

**MarketInfo:**
```typescript
interface MarketInfo {
  symbol: string
  base: string
  quote: string
  precision: Record<string, unknown>
  limits: Record<string, unknown>
}
```

## Export Functions

### `exportToText(chart: Chart, outputPath: string, preserveColors?: boolean): Promise<void>`

Export chart to text file with optional color preservation.

**Parameters:**
- `chart: Chart` - Chart instance to export
- `outputPath: string` - Output file path
- `preserveColors?: boolean` - Whether to preserve ANSI color codes (default: false)

**Example:**
```typescript
import { exportToText } from '@neabyte/candlestick-cli'

await exportToText(chart, 'chart.txt')
await exportToText(chart, 'chart.txt', true) // Preserve colors
```

### `exportToImage(chart: Chart, options: ExportOptions): Promise<void>`

Export chart to PNG image with customizable settings.

**Parameters:**
- `chart: Chart` - Chart instance to export
- `options: ExportOptions` - Export configuration

**ExportOptions:**
```typescript
interface ExportOptions {
  outputPath: string
  background?: 'light' | 'dark'  // Background theme (default: 'dark')
  scale?: number                  // Scale factor (default: 1)
}
```

**Example:**
```typescript
import { exportToImage } from '@neabyte/candlestick-cli'

await exportToImage(chart, {
  outputPath: 'chart.png',
  background: 'light',
  scale: 2
})
```

### `exportChart(chart: Chart, outputPath: string, options?: Partial<ExportOptions>): Promise<void>`

Auto-detect export format based on file extension.

**Parameters:**
- `chart: Chart` - Chart instance to export
- `outputPath: string` - Output file path (.txt or .png)
- `options?: Partial<ExportOptions>` - Optional export options

**Example:**
```typescript
import { exportChart } from '@neabyte/candlestick-cli'

await exportChart(chart, 'chart.txt')  // Text export
await exportChart(chart, 'chart.png')  // Image export
```

## Utility Functions

### Number Formatting
- `fnum(number: number): string` - Format number with commas
- `roundPrice(price: number): number` - Round price to 2 decimal places
- `formatPrice(price: number): string` - Format price with commas and 2 decimals

### Data Parsing
- `parseCandlesFromCsv(content: string): Candles` - Parse candles from CSV content
- `parseCandlesFromJson(content: string): Candles` - Parse candles from JSON content

**Example:**
```typescript
import { fnum, formatPrice, parseCandlesFromCsv } from '@neabyte/candlestick-cli'

const formatted = fnum(1234.56)        // "1,234.56"
const price = formatPrice(50000)        // "50,000.00"
const candles = parseCandlesFromCsv(csvContent)
```

## Constants

### `CONSTANTS`
Chart rendering constants including margins, dimensions, and formatting options.

### `LABELS`
Default labels and text constants used throughout the application.

### `COLORS`
Default color definitions for chart elements.

### `RESET_COLOR`
ANSI color reset code for terminal output.

**Example:**
```typescript
import { CONSTANTS, LABELS, COLORS, RESET_COLOR } from '@neabyte/candlestick-cli'

console.log(`${COLORS.RED}Error${RESET_COLOR}`)
```

## Error Types

### `OHLCError`
Error thrown when OHLC data validation fails.

### `MarketDataError`
Error thrown when market data fetching or processing fails.

### `ChartRenderError`
Error thrown when chart rendering fails.

### `ValidationError`
Error thrown when input validation fails.

### `TerminalError`
Error thrown when terminal operations fail.

### `ConfigurationError`
Error thrown when configuration is invalid.

### `ErrorType`
Enum of all error types.

**Example:**
```typescript
import { MarketDataError, ConfigurationError } from '@neabyte/candlestick-cli'

try {
  const data = await provider.fetchOHLCV('BTC/USDT')
} catch (error) {
  if (error instanceof MarketDataError) {
    console.error('Market data error:', error.message)
  }
}
```

## Types

### `Candle`
Individual candle data structure.

```typescript
interface Candle {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
  type: CandleType
}
```

### `Candles`
Array of candle data.

```typescript
type Candles = Candle[]
```

### `CandleType`
Candle type enumeration.

```typescript
type CandleType = 1 | -1  // 1 for bullish, -1 for bearish
```

### `RGBColor`
RGB color tuple.

```typescript
type RGBColor = [number, number, number]
```

### `ColorValue`
Color value union type.

```typescript
type ColorValue = string | RGBColor | number
```

### `ChartHighlights`
Price highlighting configuration.

```typescript
type ChartHighlights = Record<string, ColorValue>
```

### `ChartLabels`
Chart label configuration.

```typescript
type ChartLabels = Record<string, string>
```

### `ChartConstants`
Chart constants configuration.

```typescript
type ChartConstants = Record<string, unknown>
```

### `CandleSetStats`
Statistics for a set of candles.

```typescript
interface CandleSetStats {
  count: number
  high: number
  low: number
  open: number
  close: number
  volume: number
}
```

### `ChartDimensions`
Chart dimension configuration.

```typescript
interface ChartDimensions {
  width: number
  height: number
}
```

### `TerminalSize`
Terminal size information.

```typescript
interface TerminalSize {
  width: number
  height: number
}
```

### `ExportOptions`
Export configuration options.

```typescript
interface ExportOptions {
  outputPath: string
  background?: 'light' | 'dark'
  scale?: number
}
```

### `MarketData`
Market data structure for CCXT integration.

```typescript
interface MarketData {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}
``` 