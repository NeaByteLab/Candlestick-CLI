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
| `--symbol` | `-s` | Trading symbol for live data | `-s BTC/USDT` |

**Note**: Use either `--file` OR `--symbol`, not both.

### 🔧 Optional Options

| Option | Short | Description | Default | Example |
|--------|-------|-------------|---------|---------|
| `--title` | `-t` | Chart title | "Candlestick Chart" | `-t "BTC/USDT"` |
| `--width` | `-w` | Chart width (0 for auto) | 0 | `-w 120` |
| `--height` | `-h` | Chart height (0 for auto) | 0 | `-h 30` |
| `--bear-color` | - | Bearish candle color | Default red | `--bear-color "#ff6b6b"` |
| `--bull-color` | - | Bullish candle color | Default green | `--bull-color "#51cf66"` |
| `--no-volume` | - | Disable volume pane | Enabled | `--no-volume` |
| `--volume-height` | - | Volume pane height | 8 | `--volume-height 12` |
| `--timeframe` | - | Timeframe for live data | 1h | `--timeframe 4h` |
| `--limit` | - | Number of candles to fetch | 1000 | `--limit 200` |
| `--output` | `-o` | Export chart to file | - | `-o chart.png` |
| `--scale` | - | Scale factor for image export | 1 | `--scale 2` |
| `--background` | - | Background theme for export | dark | `--background light` |
| `--watch` | - | Enable watch mode for live updates | false | `--watch` |
| `--interval` | - | Update interval in seconds (watch mode) | 30 | `--interval 10` |
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

## 📤 Export Formats

### 📄 Text Export (.txt)

Export chart as plain text file:

```bash
candlestick-cli -f data.csv -o chart.txt
candlestick-cli -s BTC/USDT -o chart.txt
```

### 🖼️ Image Export (.png)

Export chart as high-quality PNG image:

```bash
candlestick-cli -f data.csv -o chart.png
candlestick-cli -s BTC/USDT -o chart.png --scale 2 --background light
```

**Image Export Options:**
- `--scale <number>` - Scale factor (1-4, default: 1)
- `--background <theme>` - Background theme: light or dark (default: dark)

## 🔄 Watch Mode

Enable live updates for real-time market data:

```bash
candlestick-cli -s BTC/USDT --watch
candlestick-cli -s ETH/USDT --watch --interval 10 --limit 50
```

**Watch Mode Options:**
- `--watch` - Enable watch mode (explicitly required)
- `--interval <seconds>` - Update interval (default: 30 seconds)
- `--limit <number>` - Number of candles to fetch (default: 1000)

**Note:** Watch mode only works with live data (`--symbol`) and requires explicit `--watch` flag.

## 📊 Supported Timeframes

Available timeframes for live data:

| Timeframe | Description |
|-----------|-------------|
| `1m` | 1 minute |
| `3m` | 3 minutes |
| `5m` | 5 minutes |
| `15m` | 15 minutes |
| `30m` | 30 minutes |
| `1h` | 1 hour |
| `2h` | 2 hours |
| `4h` | 4 hours |
| `6h` | 6 hours |
| `8h` | 8 hours |
| `12h` | 12 hours |
| `1d` | 1 day |
| `3d` | 3 days |
| `1w` | 1 week |
| `1M` | 1 month |

## 🏭 Perpetual Futures

Support for perpetual futures trading pairs:

```bash
candlestick-cli -s BTC/USDT:USDT --timeframe 1h --limit 150
candlestick-cli -s ETH/USDT:USDT --timeframe 15m --limit 300
```

## 📝 Examples

### 📁 File-based Charts
```bash
# Basic CSV chart
candlestick-cli -f data.csv -t "BTC/USDT"

# Custom colors
candlestick-cli -f data.json --bear-color "#ff6b6b" --bull-color "#51cf66"

# Disable volume
candlestick-cli -f data.csv --no-volume

# Custom dimensions
candlestick-cli -f data.csv -w 150 -h 40
```

### 🌐 Live Market Data
```bash
# Basic live chart
candlestick-cli -s BTC/USDT --timeframe 4h --limit 200

# Custom title and colors
candlestick-cli -s ETH/USDT --timeframe 1d --limit 100 -t "Ethereum Daily"
candlestick-cli -s BTC/USDT --bear-color "#a55eea" --bull-color "#feca57"

# Perpetual futures
candlestick-cli -s BTC/USDT:USDT --timeframe 1h --limit 150
candlestick-cli -s ETH/USDT:USDT --timeframe 15m --limit 300
```

### 🔄 Watch Mode
```bash
# Basic watch mode
candlestick-cli -s BTC/USDT --timeframe 1h --watch

# Custom interval and limit
candlestick-cli -s ETH/USDT --timeframe 15m --watch --interval 10 --limit 50

# Perpetual futures with watch
candlestick-cli -s BTC/USDT:USDT --timeframe 1h --watch --interval 15
```

### 📤 Export Examples
```bash
# Text export
candlestick-cli -f data.csv -o chart.txt
candlestick-cli -s BTC/USDT -o chart.txt

# PNG export
candlestick-cli -s BTC/USDT -o chart.png --scale 2 --background light
candlestick-cli -f data.csv -o chart.png --scale 1.5 --background dark

# High-quality export
candlestick-cli -s ETH/USDT -o chart.png --scale 3 --background light
```

## ⚠️ Limits and Constraints

- **Minimum candles:** 5
- **Maximum candles:** 10,000
- **Export formats:** Only `.txt` and `.png` supported
- **Watch mode:** Only available with live data (`--symbol`)
- **Colors:** Work best in terminals with color support (VSCode, iTerm2)

## 🎯 Tips

1. **Auto-sizing:** Use `width: 0` and `height: 0` for automatic terminal size detection
2. **Volume pane:** Default height is 8, can be customized with `--volume-height`
3. **Watch mode:** Press `Ctrl+C` to stop watching
4. **Export quality:** Use higher scale values (2-4) for better image quality
5. **Perpetual futures:** Use `:USDT` suffix for perpetual contracts 