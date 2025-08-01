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
candlestick-cli -f data.csv --volume-height 8

# Shorter volume pane
candlestick-cli -f data.csv --volume-height 3
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
candlestick-cli -f data.json -t "JSON Data"
```

## ⚙️ Complete Configuration Examples

### 1. 🎯 Full Custom Configuration

```bash
candlestick-cli \
  -f data.csv \
  -t "BTC/USDT 4H Chart" \
  --width 140 \
  --height 40 \
  --bear-color "#ff6b6b" \
  --bull-color "#51cf66" \
  --volume-height 8
```

### 2. ⚡ Minimal Configuration

```bash
candlestick-cli -f data.csv
```

### 3. 💼 Professional Trading Theme

```bash
candlestick-cli \
  -f data.csv \
  -t "Professional Trading Chart" \
  --width 120 \
  --height 30 \
  --bear-color "#e74c3c" \
  --bull-color "#27ae60" \
  --volume-height 6
```

### 4. 🌙 Dark Theme Colors

```bash
candlestick-cli \
  -f data.csv \
  -t "Dark Theme Chart" \
  --bear-color "#e74c3c" \
  --bull-color "#2ecc71"
```

## ⚠️ Error Handling Examples

### 1. 📄 File Not Found

```bash
# This will show an error
candlestick-cli -f nonexistent.csv
```

Error output:
```
❌ Error: File not found: nonexistent.csv
💡 Use --help for more information.
```

### 2. 📄 Invalid File Format

```bash
# This will show an error
candlestick-cli -f data.txt
```

Error output:
```
❌ Error: Unsupported file format. Use .csv or .json files.
💡 Use --help for more information.
```

### 3. 📊 Invalid Data

If your CSV has invalid OHLC data:
```csv
open,high,low,close,volume,timestamp
100,99,101,100,1000,1640995200000
```

Error output:
```
❌ Error: Invalid OHLC at candle 1: high (99) cannot be less than low (101)
💡 Use --help for more information.
```

### 4. 🎨 Invalid Color Format

```bash
# This will show an error
candlestick-cli -f data.csv --bear-color "invalid"
```

Error output:
```
❌ Error: Invalid bear color format: invalid. Use hex (#ff0000) or RGB (255,0,0) format.
💡 Use --help for more information.
```

## ❓ Help and Information

### 1. ❓ Display Help

```bash
candlestick-cli --help
```

Output:
```
Candlestick-CLI - Terminal candlestick chart viewer

Usage: candlestick-cli [options]

Options:
  -f, --file <path>           Path to CSV or JSON file
  -t, --title <title>         Chart title (default: "Candlestick Chart")
  -w, --width <number>        Chart width (0 for auto)
  -h, --height <number>       Chart height (0 for auto)
  --bear-color <color>        Bearish candle color (hex or RGB)
  --bull-color <color>        Bullish candle color (hex or RGB)
  --no-volume                 Disable volume pane
  --volume-height <number>    Volume pane height (default: 5)
  --help                      Show this help

Examples:
  candlestick-cli -f data.csv -t "BTC/USDT"
  candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"
  candlestick-cli -f data.csv --no-volume --width 120 --height 30

File Formats:
  CSV: Should have columns: open,high,low,close,volume,timestamp
  JSON: Array of objects with: open,high,low,close,volume,timestamp

Limits:
  Minimum: 5 candles, Maximum: 10,000 candles
```

## ⚡ Performance Examples

### 1. 📊 Large Dataset Handling

The CLI automatically handles large datasets by sampling:

```bash
# With 1000+ candles, the CLI will automatically sample
candlestick-cli -f large_dataset.csv -t "Large Dataset"
```

### 2. 💾 Memory Optimization

For very large files, consider splitting data:

```bash
# Process in chunks for large files
head -n 1000 large_file.csv > sample.csv
candlestick-cli -f sample.csv -t "Sample from Large Dataset"
```

## 🌍 Real-world Usage Examples

### 1. 📈 Trading Analysis

```bash
# Analyze BTC/USDT 4H data
candlestick-cli \
  -f btc_4h_data.csv \
  -t "BTC/USDT 4H Analysis" \
  --width 140 \
  --height 40 \
  --bear-color "#e74c3c" \
  --bull-color "#27ae60" \
  --volume-height 8
```

### 2. 💼 Portfolio Overview

```bash
# Display portfolio performance
candlestick-cli \
  -f portfolio_data.csv \
  -t "Portfolio Performance" \
  --width 120 \
  --height 30 \
  --bear-color "#ff6b6b" \
  --bull-color "#51cf66"
```

### 3. 📊 Technical Analysis

```bash
# Technical analysis chart
candlestick-cli \
  -f technical_data.csv \
  -t "Technical Analysis - Support/Resistance" \
  --width 140 \
  --height 40 \
  --bear-color "#e74c3c" \
  --bull-color "#27ae60"
```

## 🔧 Script Integration Examples

### 1. 🐚 Bash Script

Create a script `display_chart.sh`:

```bash
#!/bin/bash

# Check if file exists
if [ ! -f "$1" ]; then
    echo "Error: File $1 not found"
    exit 1
fi

# Display chart
candlestick-cli -f "$1" -t "${2:-Chart}" --width 120 --height 30
```

Usage:
```bash
chmod +x display_chart.sh
./display_chart.sh data.csv "BTC/USDT"
```

### 2. 🟢 Node.js Script

Create a script `chart_display.js`:

```javascript
import { exec } from 'child_process'
import { readFileSync } from 'fs'

const file = process.argv[2]
const title = process.argv[3] || 'Chart'

if (!file) {
  console.error('Usage: node chart_display.js <file> [title]')
  process.exit(1)
}

try {
  // Validate file exists
  readFileSync(file)
  
  // Display chart
  const command = `candlestick-cli -f ${file} -t "${title}" --width 120 --height 30`
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message)
      return
    }
    console.log(stdout)
  })
} catch (error) {
  console.error('Error reading file:', error.message)
}
```

Usage:
```bash
node chart_display.js data.csv "BTC/USDT"
```

## 🔧 Troubleshooting Examples

### 1. 📄 Check File Format

```bash
# Check CSV format
head -5 data.csv

# Check JSON format
head -20 data.json
```

### 2. ✅ Validate Data

```bash
# Check for invalid OHLC data
awk -F',' 'NR>1 && $2<$3 {print "Invalid OHLC at line " NR ": high=" $2 " low=" $3}' data.csv
```

### 3. 🧪 Test with Sample Data

```bash
# Create sample data for testing
echo "open,high,low,close,volume,timestamp" > test.csv
echo "100,105,99,103,1000,1640995200000" >> test.csv
echo "103,108,102,106,1200,1640998800000" >> test.csv

# Test the CLI
candlestick-cli -f test.csv -t "Test Chart"
``` 