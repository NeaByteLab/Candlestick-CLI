# 📊 Candlestick-CLI Documentation

Welcome to the Candlestick-CLI documentation. This directory contains comprehensive documentation for the terminal candlestick chart library.

## 🚀 Overview

Candlestick-CLI is a powerful TypeScript library for creating beautiful ASCII art candlestick charts in the terminal. It provides real-time perpetual futures market data integration, customizable styling, and professional trading visualization with export capabilities.

## ⚡ Quick Start

### 📦 Installation

```bash
npm install @neabyte/candlestick-cli
```

### 💻 Basic Usage

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

// Create chart with data
const chart = new Chart(candles, { title: 'BTC/USDT', width: 120, height: 30 })
await chart.draw()

// Or use real-time perpetual futures data
const provider = new CCXTProvider()
const data = await provider.fetch4H('BTC/USDT', 100)
const chart = new Chart(data, { title: 'BTC/USDT Perpetual Live' })
await chart.draw()
```

### 🖥️ CLI Usage

```bash
# Development mode (local)
npm run candlestick-cli -f data.csv -t "BTC/USDT"

# Installed mode (global)
candlestick-cli -f data.csv -t "BTC/USDT"

# Custom colors
candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"

# Disable volume pane
candlestick-cli -f data.csv --no-volume

# Live market data
candlestick-cli -s BTC/USDT --timeframe 4h --limit 200

# Watch mode for live updates
candlestick-cli -s BTC/USDT --watch --interval 30

# Export to PNG
candlestick-cli -s BTC/USDT -o chart.png --scale 2 --background light

# Export to text
candlestick-cli -f data.csv -o chart.txt
```

## 📚 Documentation Structure

### 📖 Core Documentation

- **[API Reference](./api-reference.md)** - Complete API documentation with examples
- **[Getting Started](./getting-started.md)** - Installation and basic usage guide
- **[CLI Reference](./cli-reference.md)** - Command-line interface documentation

### 🧩 Component Documentation

- **[Market Data](./market-data.md)** - Real-time data integration with CCXT

### 📝 Examples

- **[All Examples](./examples.md)** - Complete examples collection with code samples
- **[CLI Examples](./examples/cli.md)** - Command-line interface examples

## 🎯 Key Features

### 📊 Chart Rendering
- **Unicode-based candlestick charts** with beautiful ASCII art
- **Real-time data integration** via CCXT library
- **Smart scaling** with auto-fit and manual modes
- **Custom colors** for bullish/bearish candles
- **Volume pane** with customizable height

### 🖥️ CLI Interface
- **File-based charts** (CSV, JSON)
- **Live market data** with multiple timeframes
- **Watch mode** for real-time updates
- **Export capabilities** (PNG, TXT)
- **Perpetual futures** support

### 📤 Export Features
- **PNG image export** with high-quality rendering
- **Text export** with optional color preservation
- **Customizable scale** and background themes
- **Automatic format detection**

### 🔄 Watch Mode
- **Live updates** every 30 seconds (customizable)
- **Smooth terminal clearing** for better UX
- **Error handling** with retry mechanisms
- **Graceful shutdown** with Ctrl+C

## 🎨 Customization

### Colors
```bash
# Hex colors
--bear-color "#ff6b6b" --bull-color "#51cf66"

# RGB colors
--bear-color "255,107,107" --bull-color "81,207,102"
```

### Dimensions
```bash
# Auto-sizing
--width 0 --height 0

# Fixed dimensions
--width 120 --height 30
```

### Volume
```bash
# Custom volume height
--volume-height 12

# Disable volume
--no-volume
```

## 📊 Supported Data Sources

### File Formats
- **CSV**: Columns: open, high, low, close, volume, timestamp
- **JSON**: Array of candle objects

### Live Data
- **Spot trading**: BTC/USDT, ETH/USDT, etc.
- **Perpetual futures**: BTC/USDT:USDT, ETH/USDT:USDT
- **Timeframes**: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M

## 🚀 Advanced Features

### Smart Scaling
- **Auto-fit mode**: Automatically scales to show all data
- **Fixed mode**: Manual width/height control
- **Price-based scaling**: Custom price ranges

### Export Options
- **PNG export**: High-quality images with custom scale
- **Text export**: Plain text with optional ANSI colors
- **Background themes**: Light and dark modes

### Watch Mode
- **Real-time updates**: Live market data
- **Custom intervals**: Update frequency control
- **Error recovery**: Automatic retry on failures

## 📈 Performance

- **Optimized rendering** for large datasets (up to 10,000 candles)
- **Smart sampling** for wide charts
- **Memory efficient** with streaming data
- **Fast updates** in watch mode

## 🔧 Development

### Local Development
```bash
# Run CLI locally
npm run candlestick-cli -s BTC/USDT

# Run examples
npm run example:export
npm run example:simple
```

### Testing
```bash
# Run tests
npm test

# Lint and format
npm run lint:fix
npm run format:fix
npm run check:all
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.