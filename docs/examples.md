# 📝 Examples

This document provides comprehensive examples for using Candlestick-CLI.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Colors](#custom-colors)
- [Volume Pane](#volume-pane)
- [Price Highlighting](#price-highlighting)
- [Auto-resize](#auto-resize)
- [Scaling Modes](#scaling-modes)
- [Real-time Data](#real-time-data)
- [CLI Usage](#cli-usage)

## Basic Usage

### Simple Chart

```typescript
import { Chart } from '@neabyte/candlestick-cli'

const candles = [
  { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: 1640995200000, type: 1 },
  { open: 103, high: 108, low: 102, close: 106, volume: 1200, timestamp: 1640998800000, type: 1 },
  { open: 106, high: 110, low: 104, close: 109, volume: 1500, timestamp: 1641002400000, type: 1 },
  { open: 109, high: 112, low: 107, close: 111, volume: 1800, timestamp: 1641006000000, type: 1 },
  { open: 111, high: 115, low: 110, close: 114, volume: 2000, timestamp: 1641009600000, type: 1 }
]

const chart = new Chart(candles, { title: 'BTC/USDT', width: 120, height: 30 })
chart.draw()
```

### Custom Dimensions

```typescript
const chart = new Chart(candles, { 
  title: 'BTC/USDT',
  width: 80,    // Custom width
  height: 20    // Custom height
})
chart.draw()
```

## Custom Colors

### RGB Colors

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Set custom colors (RGB values 0-255)
chart.setBearColor(255, 107, 107)  // Red for bearish
chart.setBullColor(81, 207, 102)   // Green for bullish

chart.draw()
```

### Volume Colors

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Set volume colors
chart.setVolBearColor(255, 107, 107)  // Red for bearish volume
chart.setVolBullColor(81, 207, 102)   // Green for bullish volume

chart.draw()
```

### Hex Colors

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Set colors using hex values
chart.setBearColor(0xFF, 0x6B, 0x6B)  // #ff6b6b
chart.setBullColor(0x51, 0xCF, 0x66)  // #51cf66

chart.draw()
```

## Volume Pane

### Enable Volume Pane

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Enable volume pane
chart.setVolumePaneEnabled(true)
chart.setVolumePaneHeight(6)  // 6 lines high

chart.draw()
```

### Custom Volume Characters

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Set custom Unicode character for volume bars
chart.setVolumePaneUnicodeFill('█')  // Solid block
chart.setVolumePaneHeight(8)

chart.draw()
```

### Disable Volume Pane

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Disable volume pane
chart.setVolumePaneEnabled(false)

chart.draw()
```

## Price Highlighting

### Basic Highlighting

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Highlight specific price levels
chart.setHighlight('100.50', 'red')           // Red highlight
chart.setHighlight('110.00', [255, 255, 0])  // Yellow highlight
chart.setHighlight('105.00', [0, 255, 255])  // Cyan highlight

chart.draw()
```

### Dynamic Highlighting

```typescript
const chart = new Chart(candles, { title: 'BTC/USDT' })

// Get chart statistics for dynamic highlighting
const stats = chart.chartData.visibleCandleSet.getStats()

// Highlight key levels
chart.setHighlight(stats.maxPrice.toString(), 'green')  // Highest price
chart.setHighlight(stats.minPrice.toString(), 'red')    // Lowest price
chart.setHighlight(stats.lastPrice.toString(), 'yellow') // Current price

chart.draw()
```

## Auto-resize

### Enable Auto-resize

```typescript
const chart = new Chart(candles, { title: 'Responsive Chart' })

// Enable auto-resize (checks every 2 seconds)
chart.enableAutoResize(2000)

// The chart will automatically resize when terminal dimensions change
chart.draw()
```

### Disable Auto-resize

```typescript
const chart = new Chart(candles, { title: 'Fixed Size Chart' })

// Disable auto-resize
chart.disableAutoResize()

chart.draw()
```

## Scaling Modes

### Fit Mode (Default)

```typescript
const chart = new Chart(candles, { title: 'Fit Mode Chart' })

// Auto-fit to show all data
chart.setScalingMode('fit')
chart.fitToData()

chart.draw()
```

### Fixed Time Range

```typescript
const chart = new Chart(candles, { title: 'Fixed Range Chart' })

// Show specific time range
chart.setScalingMode('fixed')
chart.setTimeRange(0, 49)  // Show first 50 candles

chart.draw()
```

### Price Range

```typescript
const chart = new Chart(candles, { title: 'Price Range Chart' })

// Show specific price range
chart.setScalingMode('price')
chart.setPriceRange(100, 200)  // Show candles between $100-$200

chart.draw()
```

## Real-time Data

### Using CCXTProvider

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function displayLiveChart() {
  try {
    // Initialize market data provider
    const provider = new CCXTProvider()
    
    // Fetch 4-hour perpetual futures data for BTC/USDT
    const data = await provider.fetch4H('BTC/USDT', 100)
    
    // Create and display chart
    const chart = new Chart(data, { 
      title: 'BTC/USDT Perpetual 4H Live',
      width: 0,  // Auto-detect terminal size
      height: 0  // Auto-detect terminal size
    })
    
    // Set custom colors
    chart.setBearColor(234, 74, 90)   // Red for bearish
    chart.setBullColor(52, 208, 88)   // Green for bullish
    
    // Enable volume pane
    chart.setVolumePaneEnabled(true)
    chart.setVolumePaneHeight(5)
    
    // Set margins and scaling
    chart.setMargins(2, 2, 1, 0)
    chart.setScalingMode('fit')
    chart.fitToData()
    
    chart.draw()
  } catch (error) {
    console.error('Failed to display live chart:', error)
  }
}

displayLiveChart()
```

### Different Timeframes

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function displayMultipleTimeframes() {
  const provider = new CCXTProvider()
  
  // 1-hour data
  const hourlyData = await provider.fetchOHLCV('BTC/USDT', '1h', 200)
  const hourlyChart = new Chart(hourlyData, { title: 'BTC/USDT 1H' })
  hourlyChart.draw()
  
  // 4-hour data
  const fourHourData = await provider.fetch4H('BTC/USDT', 100)
  const fourHourChart = new Chart(fourHourData, { title: 'BTC/USDT 4H' })
  fourHourChart.draw()
  
  // Daily data
  const dailyData = await provider.fetch1D('BTC/USDT', 50)
  const dailyChart = new Chart(dailyData, { title: 'BTC/USDT 1D' })
  dailyChart.draw()
}

displayMultipleTimeframes()
```

### Error Handling

```typescript
import { Chart, CCXTProvider, MarketDataError } from '@neabyte/candlestick-cli'

async function displayChartWithErrorHandling() {
  try {
    const provider = new CCXTProvider()
    const data = await provider.fetch4H('BTC/USDT', 100)
    
    const chart = new Chart(data, { title: 'BTC/USDT Live' })
    chart.draw()
  } catch (error) {
    if (error instanceof MarketDataError) {
      console.error('Market data error:', error.message)
      console.error('Symbol:', error.symbol)
      console.error('Timeframe:', error.timeframe)
    } else {
      console.error('Unknown error:', error)
    }
  }
}

displayChartWithErrorHandling()
```

## CLI Usage

### Basic Commands

Display chart from CSV file:
```bash
candlestick-cli -f data.csv -t "BTC/USDT"
```

Display from JSON file:
```bash
candlestick-cli -f data.json -t "ETH/USDT"
```

### Custom Colors

Red and green theme:
```bash
candlestick-cli -f data.csv --bear-color "#ff6b6b" --bull-color "#51cf66"
```

RGB colors:
```bash
candlestick-cli -f data.csv --bear-color "255,107,107" --bull-color "81,207,102"
```

### Custom Dimensions

Fixed size:
```bash
candlestick-cli -f data.csv -w 140 -h 40
```

Auto-size:
```bash
candlestick-cli -f data.csv -w 0 -h 0
```

### Volume Configuration

Disable volume:
```bash
candlestick-cli -f data.csv --no-volume
```

Custom volume height:
```bash
candlestick-cli -f data.csv --volume-height 8
```

### Complete Example

Full configuration:
```bash
candlestick-cli \
  -f data.csv \
  -t "BTC/USDT 4H Chart" \
  -w 120 \
  -h 30 \
  --bear-color "#ff6b6b" \
  --bull-color "#51cf66" \
  --volume-height 6
```

## Advanced Examples

### Custom Margins and Scaling

```typescript
const chart = new Chart(candles, { title: 'Custom Margins' })

// Set custom margins (top, right, bottom, left)
chart.setMargins(5, 6, 3, 1)

// Set scaling mode
chart.setScalingMode('fit')
chart.fitToData()

chart.draw()
```

### Multiple Charts

```typescript
// Create multiple charts with different configurations
const chart1 = new Chart(candles, { title: 'Chart 1', width: 80, height: 20 })
chart1.setBearColor(255, 0, 0)
chart1.draw()

const chart2 = new Chart(candles, { title: 'Chart 2', width: 120, height: 30 })
chart2.setBullColor(0, 255, 0)
chart2.setVolumePaneEnabled(false)
chart2.draw()
```

### Error Handling

```typescript
import { Chart, ChartRenderError, ValidationError } from '@neabyte/candlestick-cli'

try {
  const chart = new Chart(candles, { title: 'Error Handling Example' })
  chart.draw()
} catch (error) {
  if (error instanceof ChartRenderError) {
    console.error('Chart rendering failed:', error.message)
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message)
  } else {
    console.error('Unknown error:', error)
  }
}
``` 