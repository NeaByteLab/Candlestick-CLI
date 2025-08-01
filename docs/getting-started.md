# 🚀 Getting Started

This guide will help you get up and running with Candlestick-CLI quickly.

## 📦 Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Install the Package

```bash
npm install @neabyte/candlestick-cli
```

### Verify Installation

```bash
candlestick-cli --help
```

## 💻 Basic Usage

### 1. 📊 Simple Chart Creation

Create a basic candlestick chart with sample data:

```typescript
import { Chart } from '@neabyte/candlestick-cli'

// Sample candle data
const candles = [
  { open: 100, high: 105, low: 99, close: 103, volume: 1000, timestamp: 1640995200000, type: 1 },
  { open: 103, high: 108, low: 102, close: 106, volume: 1200, timestamp: 1640998800000, type: 1 },
  { open: 106, high: 110, low: 104, close: 108, volume: 1500, timestamp: 1641002400000, type: 1 },
  { open: 108, high: 112, low: 106, close: 110, volume: 1800, timestamp: 1641006000000, type: 1 },
  { open: 110, high: 115, low: 108, close: 113, volume: 2000, timestamp: 1641009600000, type: 1 }
]

// Create and display chart
const chart = new Chart(candles, { title: 'Sample Chart', width: 120, height: 30 })
chart.draw()
```

### 2. 🔄 Real-time Market Data

Connect to live perpetual futures data using CCXT:

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function displayLiveChart() {
  // Initialize market data provider
  const provider = new CCXTProvider()
  
  // Fetch 4-hour perpetual futures data for BTC/USDT
  const data = await provider.fetch4H('BTC/USDT', 100)
  
  // Create and display chart
  const chart = new Chart(data, { title: 'BTC/USDT Perpetual 4H Live' })
  chart.draw()
}

displayLiveChart().catch(console.error)
```

### 3. 🎨 Custom Styling

Customize chart colors and appearance:

```typescript
import { Chart } from '@neabyte/candlestick-cli'

const chart = new Chart(candles, { title: 'Custom Styled Chart' })

// Set custom colors
chart.setBearColor(255, 0, 0)    // Red for bearish candles
chart.setBullColor(0, 255, 0)    // Green for bullish candles

// Configure volume pane
chart.setVolumePaneEnabled(true)
chart.setVolumePaneHeight(6)
chart.setVolBearColor(255, 100, 100)  // Light red for bearish volume
chart.setVolBullColor(100, 255, 100)  // Light green for bullish volume

chart.draw()
```

### 4. 🎯 Price Highlighting

Highlight important price levels:

```typescript
import { Chart } from '@neabyte/candlestick-cli'

const chart = new Chart(candles, { title: 'Price Highlights' })

// Highlight specific price levels
chart.setHighlight('100.50', 'red')           // Red highlight
chart.setHighlight('110.00', [255, 255, 0])  // Yellow highlight
chart.setHighlight('105.00', [0, 255, 255])  // Cyan highlight

chart.draw()
```

## 🖥️ CLI Usage

### Basic Commands

Display a chart from a CSV file:

```bash
candlestick-cli -f data.csv -t "BTC/USDT"
```

Display from JSON file with custom colors:

```bash
candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"
```

Disable volume pane:

```bash
candlestick-cli -f data.csv --no-volume
```

### 📄 File Formats

#### 📊 CSV Format

```csv
open,high,low,close,volume,timestamp
100.50,105.20,99.80,103.10,1500.5,1640995200000
103.10,108.50,102.30,106.80,1800.2,1640998800000
106.80,110.40,105.60,109.20,2200.1,1641002400000
```

#### 📋 JSON Format

```json
[
  {
    "open": 100.50,
    "high": 105.20,
    "low": 99.80,
    "close": 103.10,
    "volume": 1500.5,
    "timestamp": 1640995200000
  },
  {
    "open": 103.10,
    "high": 108.50,
    "low": 102.30,
    "close": 106.80,
    "volume": 1800.2,
    "timestamp": 1640998800000
  }
]
```

## 🔧 Advanced Features

### 📱 Auto-resize to Terminal

```typescript
const chart = new Chart(candles, { title: 'Responsive Chart' })

// Enable auto-resize
chart.enableAutoResize(1000) // Check every second

// The chart will automatically resize when terminal dimensions change
```

### 📈 Chart Scaling Modes

```typescript
const chart = new Chart(candles, { title: 'Scaled Chart' })

// Fit all data (default)
chart.setScalingMode('fit')

// Show specific time range
chart.setScalingMode('fixed')
chart.setTimeRange(0, 49) // Show first 50 candles

// Show specific price range
chart.setScalingMode('price')
chart.setPriceRange(100, 200) // Show candles between $100-$200
```

### ⚙️ Custom Margins

```typescript
const chart = new Chart(candles, { title: 'Custom Margins' })

// Set chart margins (top, right, bottom, left)
chart.setMargins(5, 6, 3, 1)
```

## ⚠️ Error Handling

The library provides comprehensive error handling:

```typescript
import { Chart, ChartRenderError, MarketDataError } from '@neabyte/candlestick-cli'

try {
  const chart = new Chart(candles, { title: 'Error Handling Example' })
  chart.draw()
} catch (error) {
  if (error instanceof ChartRenderError) {
    console.error('Chart rendering failed:', error.message)
  } else if (error instanceof MarketDataError) {
    console.error('Market data error:', error.message)
  } else {
    console.error('Unknown error:', error)
  }
}
```

## 🎯 Next Steps

- Explore the [API Reference](./api-reference.md) for detailed documentation
- Check out [Advanced Examples](./examples/advanced.md) for complex usage patterns
- Learn about [Market Data Integration](./market-data.md) for real-time trading data
- See [Customization Guide](./customization.md) for advanced styling options 