# 🔄 Market Data Integration

Complete guide to real-time market data integration using CCXT.

## 🚀 Overview

Candlestick-CLI integrates with CCXT (CryptoCurrency eXchange Trading Library) to provide real-time market data from cryptocurrency perpetual futures exchanges. The `CCXTProvider` class handles data fetching, validation, and formatting for perpetual futures markets.

## 🔧 CCXTProvider Class

### 🚀 Basic Usage

```typescript
import { CCXTProvider } from '@neabyte/candlestick-cli'

// Initialize provider
const provider = new CCXTProvider()

// Fetch data
const data = await provider.fetch4H('BTC/USDT', 100)
```

### 🏗️ Constructor

```typescript
new CCXTProvider()
```

Creates a new CCXT provider instance configured for Binance perpetual futures trading with rate limiting enabled. All data is fetched from perpetual futures markets which provide continuous trading without expiration dates.

### 🔧 Methods

#### `fetchOHLCV(symbol, timeframe, limit)`

Fetch OHLCV data from cryptocurrency perpetual futures exchange.

```typescript
async fetchOHLCV(
  symbol: string = 'BTC/USDT',
  timeframe: string = '1h',
  limit: number = 1000
): Promise<MarketData[]>
```

**Parameters:**
- `symbol` - Perpetual futures trading pair symbol (default: 'BTC/USDT')
- `timeframe` - Time interval (default: '1h')
- `limit` - Number of data points to fetch (default: 1000)

**Returns:** Array of market data with OHLCV values

**Example:**
```typescript
const data = await provider.fetchOHLCV('ETH/USDT', '4h', 500)
```

#### `fetch4H(symbol, limit)`

Convenience method for fetching 4-hour timeframe data.

```typescript
async fetch4H(
  symbol: string = 'BTC/USDT',
  limit: number = 500
): Promise<MarketData[]>
```

**Example:**
```typescript
const fourHourData = await provider.fetch4H('BTC/USDT', 200)
```

#### `fetch1D(symbol, limit)`

Convenience method for fetching daily timeframe data.

```typescript
async fetch1D(
  symbol: string = 'BTC/USDT',
  limit: number = 200
): Promise<MarketData[]>
```

**Example:**
```typescript
const dailyData = await provider.fetch1D('BTC/USDT', 100)
```

#### `getLatestPrice(symbol)`

Get latest price for perpetual futures trading pair.

```typescript
async getLatestPrice(symbol: string = 'BTC/USDT'): Promise<number>
```

**Example:**
```typescript
const currentPrice = await provider.getLatestPrice('BTC/USDT')
console.log(`Current BTC price: $${currentPrice}`)
```

#### `getMarketInfo(symbol)`

Get market information for perpetual futures trading pair.

```typescript
async getMarketInfo(symbol: string = 'BTC/USDT'): Promise<{
  symbol: string
  base: string
  quote: string
  precision: Record<string, unknown>
  limits: Record<string, unknown>
}>
```

**Example:**
```typescript
const marketInfo = await provider.getMarketInfo('BTC/USDT')
console.log(`Base: ${marketInfo.base}, Quote: ${marketInfo.quote}`)
```

## ⏰ Supported Timeframes

The following timeframes are supported for perpetual futures data:

| Timeframe | Description | Example |
|-----------|-------------|---------|
| `1m` | 1 minute | `provider.fetchOHLCV('BTC/USDT', '1m', 100)` |
| `5m` | 5 minutes | `provider.fetchOHLCV('BTC/USDT', '5m', 100)` |
| `15m` | 15 minutes | `provider.fetchOHLCV('BTC/USDT', '15m', 100)` |
| `30m` | 30 minutes | `provider.fetchOHLCV('BTC/USDT', '30m', 100)` |
| `1h` | 1 hour | `provider.fetchOHLCV('BTC/USDT', '1h', 100)` |
| `4h` | 4 hours | `provider.fetch4H('BTC/USDT', 100)` |
| `1d` | 1 day | `provider.fetch1D('BTC/USDT', 100)` |
| `1w` | 1 week | `provider.fetchOHLCV('BTC/USDT', '1w', 100)` |

## 💱 Supported Trading Pairs

Common perpetual futures pairs supported by Binance:

### 🪙 Cryptocurrency Perpetual Futures
- `BTC/USDT` - Bitcoin/USDT Perpetual
- `ETH/USDT` - Ethereum/USDT Perpetual
- `BNB/USDT` - Binance Coin/USDT Perpetual
- `ADA/USDT` - Cardano/USDT Perpetual
- `SOL/USDT` - Solana/USDT Perpetual
- `DOT/USDT` - Polkadot/USDT Perpetual
- `LINK/USDT` - Chainlink/USDT Perpetual
- `UNI/USDT` - Uniswap/USDT Perpetual
- `MATIC/USDT` - Polygon/USDT Perpetual
- `AVAX/USDT` - Avalanche/USDT Perpetual
- `ATOM/USDT` - Cosmos/USDT Perpetual
- `LTC/USDT` - Litecoin/USDT Perpetual

### 📊 Data Type
All data is fetched from **perpetual futures markets**, which provide continuous trading with leverage and no expiration dates. This ensures consistent data availability and real-time price movements.

## ⚠️ Error Handling

The CCXTProvider includes comprehensive error handling:

### 🚨 MarketDataError

Thrown when market data fetching fails:

```typescript
import { MarketDataError } from '@neabyte/candlestick-cli'

try {
  const data = await provider.fetch4H('BTC/USDT', 100)
} catch (error) {
  if (error instanceof MarketDataError) {
    console.error(`Market data error: ${error.message}`)
    console.error(`Symbol: ${error.symbol}`)
    console.error(`Timeframe: ${error.timeframe}`)
  }
}
```

### ⚠️ Common Error Scenarios

#### Invalid Symbol
```typescript
// Error: Invalid symbol: INVALID/PAIR
const data = await provider.fetch4H('INVALID/PAIR', 100)
```

#### Invalid Timeframe
```typescript
// Error: Invalid timeframe: 2h
const data = await provider.fetchOHLCV('BTC/USDT', '2h', 100)
```

#### Rate Limit Exceeded
```typescript
// Error: Rate limit exceeded, please try again later
const data = await provider.fetch4H('BTC/USDT', 10000)
```

#### Network Error
```typescript
// Error: Network error, please check your connection
const data = await provider.fetch4H('BTC/USDT', 100)
```

## ✅ Data Validation

The provider automatically validates fetched data:

### 📊 OHLC Validation
- Ensures high >= low for each candle
- Validates open and close prices
- Checks for negative values

### 🏗️ Data Structure Validation
- Verifies array format
- Ensures non-empty data
- Validates required fields

### ⚠️ Example Validation Error
```typescript
// Error: Invalid OHLC data at index 0: high < max(open, close)
const data = await provider.fetch4H('BTC/USDT', 100)
```

## ⏱️ Rate Limiting

The CCXTProvider includes built-in rate limiting:

- **Automatic rate limiting** enabled by default
- **Configurable limits** based on exchange requirements
- **Error handling** for rate limit exceeded scenarios

### ⚙️ Rate Limit Configuration

```typescript
// The provider automatically handles rate limiting
const provider = new CCXTProvider() // Rate limiting enabled by default
```

## 📝 Complete Example

### 🔄 Real-time Chart with Live Data

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function displayLiveChart() {
  try {
    // Initialize provider
    const provider = new CCXTProvider()
    
    // Fetch live perpetual futures data
    const data = await provider.fetch4H('BTC/USDT', 100)
    
    // Get current price
    const currentPrice = await provider.getLatestPrice('BTC/USDT')
    
    // Create chart
    const chart = new Chart(data, { 
      title: `BTC/USDT Perpetual 4H - Current: $${currentPrice}`,
      width: 120,
      height: 30
    })
    
    // Highlight current price
    chart.setHighlight(currentPrice.toString(), [255, 255, 0])
    
    // Display chart
    chart.draw()
    
  } catch (error) {
    if (error instanceof MarketDataError) {
      console.error('Market data error:', error.message)
    } else {
      console.error('Unknown error:', error)
    }
  }
}

displayLiveChart()
```

### 🔄 Continuous Data Updates

```typescript
import { Chart, CCXTProvider } from '@neabyte/candlestick-cli'

async function continuousChart() {
  const provider = new CCXTProvider()
  const chart = new Chart([], { title: 'Live BTC/USDT Perpetual 4H' })
  
  // Update chart every 5 minutes
  setInterval(async () => {
    try {
      const data = await provider.fetch4H('BTC/USDT', 100)
      chart.updateCandles(data, true) // Replace existing data
      chart.draw()
    } catch (error) {
      console.error('Update failed:', error.message)
    }
  }, 5 * 60 * 1000) // 5 minutes
  
  // Initial load
  const initialData = await provider.fetch4H('BTC/USDT', 100)
  chart.updateCandles(initialData, true)
  chart.draw()
}

continuousChart()
```

## ⚡ Performance Considerations

### 📊 Data Limits
- **Maximum candles**: 10,000 per request
- **Recommended limit**: 1,000 for optimal performance
- **Memory usage**: ~1MB per 1,000 candles

### 🌐 Network Optimization
- **Rate limiting**: Automatic to prevent API abuse
- **Caching**: Consider implementing local caching for frequent requests
- **Connection pooling**: CCXT handles connection management

### 🔄 Error Recovery
- **Automatic retries**: Not implemented by default
- **Manual retry logic**: Implement exponential backoff for production use
- **Fallback data**: Consider local data as fallback

## 🔧 Troubleshooting

### ⚠️ Common Issues

**Network connectivity:**
```typescript
// Error: Network error, please check your connection
```
Solution: Check internet connection and firewall settings

**Invalid symbol:**
```typescript
// Error: Invalid symbol: BTC/USDT
```
Solution: Verify symbol format and availability on Binance perpetual futures

**Rate limit exceeded:**
```typescript
// Error: Rate limit exceeded, please try again later
```
Solution: Reduce request frequency or implement caching

**Data validation errors:**
```typescript
// Error: Invalid OHLC data at index 0
```
Solution: Check exchange data quality or implement data filtering 