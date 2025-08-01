# 📊 Candlestick-CLI Documentation

Welcome to the Candlestick-CLI documentation. This directory contains comprehensive documentation for the terminal candlestick chart library.

## 🚀 Overview

Candlestick-CLI is a powerful TypeScript library for creating beautiful ASCII art candlestick charts in the terminal. It provides real-time perpetual futures market data integration, customizable styling, and professional trading visualization.

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
chart.draw()

// Or use real-time perpetual futures data
const provider = new CCXTProvider()
const data = await provider.fetch4H('BTC/USDT', 100)
const chart = new Chart(data, { title: 'BTC/USDT Perpetual Live' })
chart.draw()
```

### 🖥️ CLI Usage

```bash
# Display chart from CSV file
candlestick-cli -f data.csv -t "BTC/USDT"

# Custom colors
candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"

# Disable volume pane
candlestick-cli -f data.csv --no-volume
```

## 📚 Documentation Structure

### 📖 Core Documentation

- **[API Reference](./api-reference.md)** - Complete API documentation with examples
- **[Getting Started](./getting-started.md)** - Installation and basic usage guide
- **[CLI Reference](./cli-reference.md)** - Command-line interface documentation

### 🧩 Component Documentation

- **[API Reference](./api-reference.md)** - Complete API documentation with examples
- **[Market Data](./market-data.md)** - Real-time data integration with CCXT

### 📝 Examples

- **[All Examples](./examples.md)** - Complete examples collection with code samples
- **[CLI Examples](./examples/cli.md)** - Command-line interface examples