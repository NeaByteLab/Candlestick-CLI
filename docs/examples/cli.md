# 💻 CLI Examples

Command-line interface usage examples for Candlestick-CLI.

## 🚀 Basic CLI Usage

### 1. 📊 Display Chart from CSV File

```bash
# Basic usage with CSV file
candlestick-cli -f data.csv -t "BTC/USDT"

# With custom dimensions
candlestick-cli -f data.csv -t "BTC/USDT" --width 140 --height 40

# Auto-sized chart
candlestick-cli -f data.csv -t "BTC/USDT" --width 0 --height 0
```

### 2. 📋 Display Chart from JSON File

```bash
# Basic usage with JSON file
candlestick-cli -f data.json -t "ETH/USDT"

# With custom colors
candlestick-cli -f data.json -t "ETH/USDT" --bear-color "#ff6b6b" --bull-color "#51cf66"
```

## 🌐 Live Market Data Examples

### 1. 📈 Basic Live Chart

```bash
# Live BTC/USDT data
candlestick-cli -s BTC/USDT --timeframe 4h --limit 200

# Live ETH/USDT data
candlestick-cli -s ETH/USDT --timeframe 1h --limit 100
```

### 2. 🏭 Perpetual Futures

```bash
# Perpetual futures trading
candlestick-cli -s BTC/USDT:USDT --timeframe 4h --limit 150

# ETH perpetual futures
candlestick-cli -s ETH/USDT:USDT --timeframe 1h --limit 100
```

### 3. 🔄 Watch Mode

```bash
# Watch mode with 30-second updates
candlestick-cli -s BTC/USDT --watch --interval 30

# Watch mode with custom interval
candlestick-cli -s ETH/USDT --watch --interval 10 --limit 50
```

## 🎨 Color Customization Examples

### 1. 🔴 Red and Green Theme

```bash
# Traditional red/green theme
candlestick-cli -f data.csv --bear-color "#ff6b6b" --bull-color "#51cf66"
```

### 2. 🔵 Blue and Orange Theme

```bash
# Blue/orange theme
candlestick-cli -f data.csv --bear-color "#ff6b6b" --bull-color "#4ecdc4"
```

### 3. 🟣 Purple and Yellow Theme

```bash
# Purple/yellow theme
candlestick-cli -f data.csv --bear-color "#a55eea" --bull-color "#feca57"
```

### 4. 🎨 RGB Color Format

```bash
# Using RGB values
candlestick-cli -f data.csv --bear-color "255,107,107" --bull-color "81,207,102"
```

## 📈 Volume Pane Examples

### 1. ❌ Disable Volume Pane

```bash
# Chart without volume pane
candlestick-cli -f data.csv --no-volume
```

### 2. 📏 Custom Volume Height

```bash
# Taller volume pane
candlestick-cli -f data.csv --volume-height 12

# Shorter volume pane
candlestick-cli -f data.csv --volume-height 5
```

## 📤 Export Examples

### 1. 📄 Text Export

```bash
# Export to text file
candlestick-cli -f data.csv -o chart.txt

# Export live data to text
candlestick-cli -s BTC/USDT -o chart.txt
```

### 2. 🖼️ PNG Export

```bash
# Basic PNG export
candlestick-cli -f data.csv -o chart.png

# High-quality PNG export
candlestick-cli -s BTC/USDT -o chart.png --scale 2 --background light

# Dark theme PNG export
candlestick-cli -f data.csv -o chart.png --scale 1.5 --background dark
```

## 📄 File Format Examples

### 1. 📊 CSV File Format

Create a CSV file `data.csv`:

```csv
open,high,low,close,volume,timestamp
100.50,105.20,99.80,103.10,1500.5,1640995200000
103.10,108.50,102.30,106.80,1800.2,1640998800000
106.80,110.40,105.60,109.20,2200.1,1641002400000
109.20,112.80,108.40,111.50,2500.3,1641006000000
111.50,115.20,110.80,113.90,2800.7,1641009600000
```

Display the chart:
```bash
candlestick-cli -f data.csv -t "Sample Data"
```

### 2. 📋 JSON File Format

Create a JSON file `data.json`:

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
  },
  {
    "open": 106.80,
    "high": 110.40,
    "low": 105.60,
    "close": 109.20,
    "volume": 2200.1,
    "timestamp": 1641002400000
  }
]
```

Display the chart:
```bash
candlestick-cli -f data.json -t "JSON Sample Data"
```

## 🕒 Timeframe Examples

### 1. ⚡ Short-term Timeframes

```bash
# 1-minute data
candlestick-cli -s BTC/USDT --timeframe 1m --limit 100

# 5-minute data
candlestick-cli -s BTC/USDT --timeframe 5m --limit 200

# 15-minute data
candlestick-cli -s BTC/USDT --timeframe 15m --limit 150
```

### 2. 📊 Medium-term Timeframes

```bash
# 1-hour data
candlestick-cli -s BTC/USDT --timeframe 1h --limit 100

# 4-hour data
candlestick-cli -s BTC/USDT --timeframe 4h --limit 200

# 1-day data
candlestick-cli -s BTC/USDT --timeframe 1d --limit 50
```

### 3. 📈 Long-term Timeframes

```bash
# 1-week data
candlestick-cli -s BTC/USDT --timeframe 1w --limit 52

# 1-month data
candlestick-cli -s BTC/USDT --timeframe 1M --limit 12
```

## 🎯 Advanced Examples

### 1. 🔄 Real-time Monitoring

```bash
# Monitor BTC with 10-second updates
candlestick-cli -s BTC/USDT --watch --interval 10 --limit 50

# Monitor ETH with 1-minute updates
candlestick-cli -s ETH/USDT --watch --interval 60 --limit 100
```

### 2. 🎨 Custom Styling

```bash
# Custom colors with live data
candlestick-cli -s BTC/USDT --bear-color "#ff6b6b" --bull-color "#51cf66" --volume-height 10

# Custom dimensions with file data
candlestick-cli -f data.csv --width 150 --height 40 --volume-height 8
```

### 3. 📤 Export with Custom Settings

```bash
# Export live data to high-quality PNG
candlestick-cli -s BTC/USDT -o chart.png --scale 3 --background light

# Export file data to text with custom title
candlestick-cli -f data.csv -o chart.txt -t "Custom Chart Title"
```

## 🔧 Development Examples

### 1. 🛠️ Local Development

```bash
# Run from source code
npm run candlestick-cli -f data.csv -t "Development Chart"

# Run with custom options
npm run candlestick-cli -s BTC/USDT --timeframe 4h --limit 100
```

### 2. 🧪 Testing Different Configurations

```bash
# Test auto-sizing
npm run candlestick-cli -f data.csv --width 0 --height 0

# Test custom colors
npm run candlestick-cli -f data.csv --bear-color "255,0,0" --bull-color "0,255,0"

# Test volume settings
npm run candlestick-cli -f data.csv --volume-height 12
```

## 📊 Complete Examples

### 1. 📈 Professional Trading Chart

```bash
# Full-featured trading chart
candlestick-cli -s BTC/USDT:USDT \
  --timeframe 4h \
  --limit 200 \
  --title "BTC/USDT Perpetual 4H" \
  --bear-color "#ff6b6b" \
  --bull-color "#51cf66" \
  --volume-height 10 \
  --width 140 \
  --height 40
```

### 2. 🔄 Live Monitoring Dashboard

```bash
# Live monitoring with custom settings
candlestick-cli -s ETH/USDT \
  --watch \
  --interval 30 \
  --limit 100 \
  --title "ETH/USDT Live Monitor" \
  --bear-color "#a55eea" \
  --bull-color "#feca57" \
  --volume-height 8
```

### 3. 📤 Export for Analysis

```bash
# Export high-quality chart for analysis
candlestick-cli -s BTC/USDT \
  --timeframe 1d \
  --limit 30 \
  -o btc-daily-analysis.png \
  --scale 2 \
  --background light \
  --title "BTC/USDT Daily Analysis"
```

## ⚠️ Error Handling Examples

### 1. 🔍 Invalid File Path

```bash
# Error: File not found
candlestick-cli -f nonexistent.csv -t "Test"
# Output: ❌ Error: File not found: nonexistent.csv
```

### 2. 🌐 Network Issues

```bash
# Error: Network connection failed
candlestick-cli -s BTC/USDT --timeframe 4h
# Output: ❌ Error: Network error, please check your connection
```

### 3. 📊 Invalid Data Format

```bash
# Error: Invalid CSV format
candlestick-cli -f malformed.csv -t "Test"
# Output: ❌ Error: Invalid CSV format
```

## 💡 Tips and Best Practices

### 1. 📊 Data Limits
- **Maximum candles**: 10,000 per request
- **Recommended limit**: 1,000 for optimal performance
- **Memory usage**: ~1MB per 1,000 candles

### 2. 🌐 Network Optimization
- Use appropriate timeframes for your analysis
- Implement caching for frequent requests
- Monitor rate limits for live data

### 3. 🎨 Visual Optimization
- Use auto-sizing (`--width 0 --height 0`) for best fit
- Customize colors for better visibility
- Adjust volume height based on data density

### 4. 🔄 Watch Mode Tips
- Use longer intervals (30+ seconds) to avoid rate limits
- Monitor system resources during long-running sessions
- Implement proper error handling for production use 