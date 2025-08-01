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

#### `draw(): void`
Renders the chart to console output.

#### `setBearColor(r: number, g: number, b: number): void`
Set bearish candle color (RGB values 0-255).

#### `setBullColor(r: number, g: number, b: number): void`
Set bullish candle color (RGB values 0-255).

#### `setVolBearColor(r: number, g: number, b: number): void`
Set volume bearish color (RGB values 0-255).

#### `setVolBullColor(r: number, g: number, b: number): void`
Set volume bullish color (RGB values 0-255).

#### `setVolumePaneEnabled(enabled: boolean): void`
Enable or disable volume pane display.

#### `setVolumePaneHeight(height: number): void`
Set volume pane height in lines.

#### `setVolumePaneUnicodeFill(unicodeFill: string): void`
Set Unicode character for volume bars.

#### `setHighlight(price: string, color: ColorValue): void`
Highlight specific price level with color.

#### `setName(name: string): void`
Set chart name/title.

#### `setLabel(label: string, value: string): void`
Set info bar label.

#### `updateCandles(candles: Candles, reset?: boolean): void`
Update chart with new candle data.

#### `updateSize(width: number, height: number): void`
Update chart dimensions.

#### `updateSizeFromTerminal(): void`
Update size from current terminal dimensions.

#### `enableAutoResize(interval?: number): void`
Enable automatic terminal size following.

#### `disableAutoResize(): void`
Disable automatic terminal size following.

#### `setMargins(top?: number, right?: number, bottom?: number, left?: number): void`
Set chart margins.

#### `setScalingMode(mode: 'fit' | 'fixed' | 'price'): void`
Set chart scaling mode.

#### `setPriceRange(minPrice: number, maxPrice: number): void`
Set price range for price-based scaling.

#### `setTimeRange(startIndex: number, endIndex: number): void`
Set time range for fixed scaling.

#### `fitToData(): void`
Auto-fit chart to show all data.

## ChartData Class

Manages chart dimensions and visible candles.

### Constructor

```typescript
new ChartData(candles: Candles, options?: ChartDataOptions)
```

**ChartDataOptions:**
```typescript
interface ChartDataOptions {
  width?: number   // Chart width
  height?: number  // Chart height
}
```

### Methods

#### `getTerminalSize(): TerminalSize`
Get current terminal dimensions.

#### `computeHeight(volumePaneHeight: number): void`
Compute chart height based on volume pane.

#### `computeVisibleCandles(): void`
Compute which candles are visible based on scaling mode.

#### `resetCandles(): void`
Reset all candles.

#### `addCandles(candles: Candles): void`
Add candles to main set.

#### `setSize(width: number, height: number): void`
Set chart size.

#### `setMargins(top: number, right: number, bottom: number, left: number): void`
Set chart margins.

#### `setScalingMode(mode: 'fit' | 'fixed' | 'price'): void`
Set chart scaling mode.

#### `setPriceRange(minPrice: number, maxPrice: number): void`
Set price range for price-based scaling.

#### `setTimeRange(startIndex: number, endIndex: number): void`
Set time range for fixed scaling.

#### `fitToData(): void`
Auto-fit chart to show all data.

## ChartRenderer Class

Handles the main chart rendering logic for Unicode-based candlestick charts.

### Constructor

```typescript
new ChartRenderer()
```

### Properties

- `bearishColor: RGBColor` - Bearish candle color (default: [234, 74, 90])
- `bullishColor: RGBColor` - Bullish candle color (default: [52, 208, 88])

### Methods

#### `render(chart: Chart): string`
Render the complete Unicode candlestick chart for terminal display.

## YAxis Class

Handles price-to-height conversion and axis rendering.

### Constructor

```typescript
new YAxis(chartData: ChartData)
```

### Methods

#### `priceToHeights(candle: Candle): [number, number, number, number]`
Convert candle prices to height coordinates.

#### `renderLine(y: number, highlights?: ChartHighlights): string`
Render a line of the Y-axis.

#### `renderEmpty(y?: number, highlights?: ChartHighlights): string`
Render empty line.

## VolumePane Class

Renders volume bars for candles.

### Constructor

```typescript
new VolumePane(height: number)
```

### Properties

- `height: number` - Volume pane height
- `enabled: boolean` - Whether volume pane is enabled (default: true)
- `bearishColor: RGBColor` - Bearish volume color (default: [234, 74, 90])
- `bullishColor: RGBColor` - Bullish volume color (default: [52, 208, 88])
- `unicodeFill: string` - Unicode character for volume bars

### Methods

#### `render(candle: Candle, y: number, maxVolume: number): string`
Render volume bar for a candle.

## InfoBar Class

Displays chart statistics and information.

### Constructor

```typescript
new InfoBar(name: string)
```

### Properties

- `name: string` - Chart name
- `labels: ChartLabels` - Label configuration

### Methods

#### `renderPrice(stats: CandleSetStats): string`
Render current price.

#### `renderHighest(stats: CandleSetStats): string`
Render highest price.

#### `renderLowest(stats: CandleSetStats): string`
Render lowest price.

#### `renderVariation(stats: CandleSetStats): string`
Render price variation.

#### `renderAverage(stats: CandleSetStats): string`
Render average price.

#### `renderVolume(stats: CandleSetStats): string`
Render volume information.

#### `render(stats: CandleSetStats, width: number): string`
Render the complete info bar.

## CandleSet Class

Manages a collection of candles and computes statistics.

### Constructor

```typescript
new CandleSet(candles: Candles)
```

### Properties

- `candles: Candles` - Array of candles
- `minPrice: number` - Minimum price
- `maxPrice: number` - Maximum price
- `minVolume: number` - Minimum volume
- `maxVolume: number` - Maximum volume
- `variation: number` - Price variation percentage
- `average: number` - Average price
- `lastPrice: number` - Last price
- `cumulativeVolume: number` - Cumulative volume

### Methods

#### `addCandles(newCandles: Candles): void`
Add candles to the set.

#### `setCandles(newCandles: Candles): void`
Set candles and recompute statistics.

#### `getStats(): CandleSetStats`
Get statistics as a structured object.

## Types

### Candle

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

### CandleType

```typescript
enum CandleType {
  Bearish = -1,
  Bullish = 1
}
```

### Candles

```typescript
type Candles = Candle[]
```

### RGBColor

```typescript
type RGBColor = [number, number, number]
```

### ColorValue

```typescript
type ColorValue = string | RGBColor | number
```

### ChartHighlights

```typescript
type ChartHighlights = Record<string, ColorValue>
```

### CandleSetStats

```typescript
interface CandleSetStats {
  minPrice: number
  maxPrice: number
  minVolume: number
  maxVolume: number
  variation: number
  average: number
  lastPrice: number
  cumulativeVolume: number
}
```

### TerminalSize

```typescript
interface TerminalSize {
  width: number
  height: number
}
```

### ChartLabels

```typescript
interface ChartLabels {
  price?: string
  highest?: string
  lowest?: string
  variation?: string
  average?: string
  volume?: string
}
``` 