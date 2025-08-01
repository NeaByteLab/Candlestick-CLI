# 📊 Market Data Integration

Complete guide for integrating real-time market data using CCXT library.

## 🚀 Overview

Candlestick-CLI provides seamless integration with cryptocurrency exchanges through the CCXT library. The `CCXTProvider` class handles all market data fetching, validation, and processing with comprehensive error handling.

## 📦 Installation

CCXT is included as a dependency:

```bash
npm install @neabyte/candlestick-cli
```

## 💻 Basic Usage

### Import CCXTProvider

```typescript
import { CCXTProvider } from '@neabyte/candlestick-cli'
```

### Create Provider Instance

```typescript
const provider = new CCXTProvider()
```

The provider is automatically configured for Binance futures trading with rate limiting enabled.

## 📊 Data Fetching Methods

### `fetchOHLCV(symbol, timeframe, limit)`

Fetch OHLCV data from the exchange.

**Parameters:**
- `symbol?: string` - Trading pair (default: 'BTC/USDT')
- `timeframe?: string` - Time interval (default: '1h')
- `limit?: number` - Number of candles (default: 1000)

**Returns:** `Promise<Candles>`

**Example:**
```typescript
const provider = new CCXTProvider()

// Basic usage
const data = await provider.fetchOHLCV('BTC/USDT', '4h', 200)

// With defaults
const data = await provider.fetchOHLCV() // BTC/USDT, 1h, 1000 candles
```

### `fetch4H(symbol, limit)`

Convenience method for 4-hour timeframe data.

**Parameters:**
- `symbol?: string` - Trading pair (default: 'BTC/USDT')
- `limit?: number` - Number of candles (default: 500)

**Returns:** `Promise<Candles>`

**Example:**
```typescript
const provider = new CCXTProvider()

// Fetch 4-hour data
const data = await provider.fetch4H('BTC/USDT', 100)
const ethData = await provider.fetch4H('ETH/USDT', 200)
```

### `fetch1D(symbol, limit)`

Convenience method for 1-day timeframe data.

**Parameters:**
- `symbol?: string` - Trading pair (default: 'BTC/USDT')
- `limit?: number` - Number of candles (default: 200)

**Returns:** `Promise<Candles>`

**Example:**
```typescript
const provider = new CCXTProvider()

// Fetch daily data
const data = await provider.fetch1D('BTC/USDT', 50)
const ethData = await provider.fetch1D('ETH/USDT', 100)
```

## 💰 Market Information

### `getLatestPrice(symbol)`

Get the latest price for a trading pair.

**Parameters:**
- `symbol?: string` - Trading pair (default: 'BTC/USDT')

**Returns:** `Promise<number>`

**Example:**
```typescript
const provider = new CCXTProvider()

const price = await provider.getLatestPrice('BTC/USDT')
console.log(`Current BTC price: $${price}`)

const ethPrice = await provider.getLatestPrice('ETH/USDT')
console.log(`Current ETH price: $${ethPrice}`)
```

### `getMarketInfo(symbol)`

Get detailed market information for a trading pair.

**Parameters:**
- `symbol?: string` - Trading pair (default: 'BTC/USDT')

**Returns:** `Promise<MarketInfo>`

**MarketInfo Interface:**
```typescript
interface MarketInfo {
  symbol: string
  base: string
  quote: string
  precision: Record<string, unknown>
  limits: Record<string, unknown>
}
```

**Example:**
```typescript
const provider = new CCXTProvider()

const info = await provider.getMarketInfo('BTC/USDT')
console.log(`Symbol: ${info.symbol}`)
console.log(`Base: ${info.base}`)
console.log(`Quote: ${info.quote}`)
```

## 🕒 Supported Timeframes

| Timeframe | Description | Use Case |
|-----------|-------------|----------|
| `1m` | 1 minute | High-frequency trading |
| `3m` | 3 minutes | Short-term analysis |
| `5m` | 5 minutes | Intraday trading |
| `15m` | 15 minutes | Swing trading |
| `30m` | 30 minutes | Medium-term analysis |
| `1h` | 1 hour | Day trading |
| `2h` | 2 hours | Short-term trends |
| `4h` | 4 hours | Medium-term trends |
| `6h` | 6 hours | Position trading |
| `8h` | 8 hours | Extended analysis |
| `12h` | 12 hours | Long-term analysis |
| `1d` | 1 day | Daily analysis |
| `3d` | 3 days | Weekly analysis |
| `1w` | 1 week | Monthly analysis |
| `1M` | 1 month | Long-term analysis |

## 🏭 Perpetual Futures

The provider supports perpetual futures trading pairs with the `:USDT` suffix:

```typescript
const provider = new CCXTProvider()

// Perpetual futures
const btcFutures = await provider.fetch4H('BTC/USDT:USDT', 100)
const ethFutures = await provider.fetch1D('ETH/USDT:USDT', 50)

// Spot trading
const btcSpot = await provider.fetch4H('BTC/USDT', 100)
```

## 🔄 Error Handling

The provider includes comprehensive error handling for various scenarios:

### MarketDataError

Thrown when market data fetching fails:

```typescript
import { MarketDataError } from '@neabyte/candlestick-cli'

try {
  const data = await provider.fetchOHLCV('BTC/USDT', '4h', 100)
} catch (error) {
  if (error instanceof MarketDataError) {
    console.error('Market data error:', error.message)
    console.error('Symbol:', error.symbol)
    console.error('Timeframe:', error.timeframe)
  }
}
```

### Common Error Scenarios

- **Network errors**: Connection issues or timeouts
- **Rate limiting**: Exchange API rate limits exceeded
- **Invalid symbols**: Unsupported trading pairs
- **Invalid timeframes**: Unsupported time intervals
- **Data validation**: Malformed OHLCV data

## 📈 Data Validation

The provider automatically validates all fetched data:

### OHLC Validation
- Ensures high ≥ low for each candle
- Validates open and close prices
- Checks for reasonable price ranges

### Volume Validation
- Validates volume data is present
- Ensures volume values are positive
- Checks for reasonable volume ranges

### Timestamp Validation
- Ensures timestamps are in milliseconds
- Validates chronological order
- Checks for reasonable time ranges

## 🚀 Advanced Usage

### Custom Error Handling

```typescript
const provider = new CCXTProvider()

async function fetchWithRetry(symbol: string, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await provider.fetch4H(symbol, 100)
    } catch (error) {
      if (i === attempts - 1) throw error
      console.log(`Attempt ${i + 1} failed, retrying...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

const data = await fetchWithRetry('BTC/USDT')
```

### Multiple Symbols

```typescript
const provider = new CCXTProvider()

async function fetchMultipleSymbols(symbols: string[]) {
  const results = await Promise.allSettled(
    symbols.map(symbol => provider.fetch4H(symbol, 50))
  )
  
  return results.map((result, index) => ({
    symbol: symbols[index],
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }))
}

const results = await fetchMultipleSymbols(['BTC/USDT', 'ETH/USDT', 'ADA/USDT'])
```

### Real-time Price Monitoring

```typescript
const provider = new CCXTProvider()

async function monitorPrice(symbol: string, interval: number = 5000) {
  while (true) {
    try {
      const price = await provider.getLatestPrice(symbol)
      console.log(`${symbol}: $${price}`)
      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      console.error(`Error fetching ${symbol} price:`, error.message)
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
}

// Monitor BTC price every 5 seconds
monitorPrice('BTC/USDT', 5000)
```

## 📊 Data Structure

### Candle Format

Each candle contains:

```typescript
interface Candle {
  open: number      // Opening price
  high: number      // Highest price
  low: number       // Lowest price
  close: number     // Closing price
  volume: number    // Trading volume
  timestamp: number // Unix timestamp in milliseconds
  type: CandleType  // 1 for bullish, -1 for bearish
}
```

### Market Data Format

Raw market data from exchange:

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

## 🔧 Configuration

### Exchange Settings

The provider is pre-configured for Binance futures:

```typescript
// Default configuration
{
  enableRateLimit: true,
  options: {
    defaultType: 'future'
  }
}
```

### Rate Limiting

Rate limiting is enabled by default to prevent API abuse. The provider automatically handles:

- Request throttling
- Rate limit headers
- Exponential backoff
- Retry logic

## 📝 Examples

### Complete Chart with Live Data

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function createLiveChart() {
  const provider = new CCXTProvider()
  const data = await provider.fetch4H('BTC/USDT', 100)
  
  const chart = new Chart(data, {
    title: 'BTC/USDT 4H Live Chart',
    width: 120,
    height: 30
  })
  
  await chart.draw()
}

createLiveChart().catch(console.error)
```

### Watch Mode with Real-time Updates

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function watchChart(symbol: string, interval: number = 30000) {
  const provider = new CCXTProvider()
  const chart = new Chart([], { title: `${symbol} Live` })
  
  while (true) {
    try {
      const data = await provider.fetch4H(symbol, 50)
      chart.updateCandles(data, true)
      await chart.draw()
      
      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      console.error('Error updating chart:', error.message)
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
}

watchChart('BTC/USDT', 30000) // Update every 30 seconds
```

### Export Live Data

```typescript
import { Chart, CCXTProvider, exportToImage } from '@neabyte/candlestick-cli'

async function exportLiveChart() {
  const provider = new CCXTProvider()
  const data = await provider.fetch1D('ETH/USDT', 30)
  
  const chart = new Chart(data, {
    title: 'ETH/USDT Daily Chart'
  })
  
  await exportToImage(chart, {
    outputPath: 'eth-chart.png',
    background: 'dark',
    scale: 2
  })
}

exportLiveChart().catch(console.error)
``` 