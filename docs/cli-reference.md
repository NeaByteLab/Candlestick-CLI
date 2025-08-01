# 🖥️ CLI Reference

Complete command-line interface documentation for Candlestick-CLI.

## 🚀 Usage

### Development Mode (Local)
```bash
npm run candlestick-cli [options]
```

### Installed Mode (Global)
```bash
candlestick-cli [options]
```

**Note**: Use `npm run candlestick-cli` for development and `candlestick-cli` after global installation.

## ⚙️ Options

### 🔧 Required Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--file` | `-f` | Path to CSV or JSON file | `-f data.csv` |

### 🔧 Optional Options

| Option | Short | Description | Default | Example |
|--------|-------|-------------|---------|---------|
| `--title` | `-t` | Chart title | "Candlestick Chart" | `-t "BTC/USDT"` |
| `--width` | `-w` | Chart width (0 for auto) | 0 | `-w 120` |
| `--height` | `-h` | Chart height (0 for auto) | 0 | `-h 30` |
| `--bear-color` | - | Bearish candle color | Default red | `--bear-color "#ff6b6b"` |
| `--bull-color` | - | Bullish candle color | Default green | `--bull-color "#51cf66"` |
| `--no-volume` | - | Disable volume pane | Enabled | `--no-volume` |
| `--volume-height` | - | Volume pane height | 5 | `--volume-height 8` |
| `--help` | - | Show help information | - | `--help` |

## 🎨 Color Formats

Colors can be specified in multiple formats:

### 🔴 Hex Colors
```bash
candlestick-cli -f data.csv --bear-color "#ff6b6b" --bull-color "#51cf66"
```

### 🟢 RGB Colors
```bash
candlestick-cli -f data.csv --bear-color "255,107,107" --bull-color "81,207,102"
```

## 📄 File Formats

### 📊 CSV Format

The CSV file should have the following columns:
- `open` - Opening price
- `high` - Highest price
- `low` - Lowest price
- `close` - Closing price
- `volume` - Trading volume (optional)
- `timestamp` - Unix timestamp in milliseconds (optional)

Example CSV:
```csv
open,high,low,close,volume,timestamp
100.50,105.20,99.80,103.10,1500.5,1640995200000
103.10,108.50,102.30,106.80,1800.2,1640998800000
106.80,110.40,105.60,109.20,2200.1,1641002400000
```

### 📋 JSON Format

The JSON file should contain an array of candle objects:

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

## 📝 Examples

### 🚀 Basic Usage

Display a chart from CSV file:
```bash
candlestick-cli -f data.csv -t "BTC/USDT"
```

Display from JSON file:
```bash
candlestick-cli -f data.json -t "ETH/USDT"
```

### 🎨 Custom Colors

Red and green theme:
```bash
candlestick-cli -f data.csv --bear-color "#ff6b6b" --bull-color "#51cf66"
```

Blue and orange theme:
```bash
candlestick-cli -f data.csv --bear-color "#ff6b6b" --bull-color "#4ecdc4"
```

### 📐 Custom Dimensions

Fixed size chart:
```bash
candlestick-cli -f data.csv --width 140 --height 40
```

Auto-sized chart:
```bash
candlestick-cli -f data.csv --width 0 --height 0
```

### 📈 Volume Configuration

Disable volume pane:
```bash
candlestick-cli -f data.csv --no-volume
```

Custom volume height:
```bash
candlestick-cli -f data.csv --volume-height 8
```

### 🎯 Complete Example

Full configuration with all options:
```bash
candlestick-cli \
  -f data.csv \
  -t "BTC/USDT 4H Chart" \
  --width 120 \
  --height 30 \
  --bear-color "#ff6b6b" \
  --bull-color "#51cf66" \
  --volume-height 6
```

## ⚠️ Error Handling

The CLI provides comprehensive error handling and validation:

### 📄 File Validation
- Checks if file exists
- Validates file format (CSV or JSON)
- Ensures required columns are present

### 📊 Data Validation
- Validates OHLC relationships (high >= low)
- Checks for negative prices
- Validates volume data (if present)
- Ensures minimum 5 candles

### 🎨 Color Validation
- Validates hex color format
- Validates RGB color format
- Provides helpful error messages

### 📐 Dimension Validation
- Ensures width and height are within valid ranges
- Provides fallbacks for invalid values

## ❓ Help Information

Display help:
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

## 🔢 Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Error (file not found, invalid data, etc.) |

## ⚡ Performance Considerations

- **Large datasets**: The CLI automatically samples data when there are more candles than available width
- **Memory usage**: Optimized for datasets up to 10,000 candles
- **Rendering speed**: Efficient Unicode-based rendering for fast display

## 🔧 Troubleshooting

### Common Issues

**File not found:**
```bash
Error: File not found: data.csv
```
Solution: Check file path and ensure file exists

**Invalid file format:**
```bash
Error: Unsupported file format. Use .csv or .json files.
```
Solution: Ensure file has .csv or .json extension

**Invalid data:**
```bash
Error: Invalid OHLC at candle 1: high (99) cannot be less than low (100)
```
Solution: Check your data for valid OHLC relationships

**Invalid color:**
```bash
Error: Invalid bear color format: invalid. Use hex (#ff0000) or RGB (255,0,0) format.
```
Solution: Use valid hex or RGB color format 