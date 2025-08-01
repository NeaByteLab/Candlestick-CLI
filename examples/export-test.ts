import { exportToText, exportToImage } from '@/utils/export'
import { CCXTProvider } from '@/core/ccxt'
import { EXAMPLE_CONFIG, createExampleChart, getOutputPaths } from './shared'

// Global types for Node.js environment
declare const process: {
  exit(code?: number): never
}
declare const console: {
  error(message: string): void
  log(message: string): void
}

/**
 * Enhanced export test with multiple background themes
 *
 * Generates both text and image exports with light and dark backgrounds
 * using the central shared configuration for consistency.
 */
async function main(): Promise<void> {
  try {
    const provider = new CCXTProvider()
    const candles = await provider.fetchOHLCV('BTC/USDT', '4h', 200)
    const chart = createExampleChart(candles)
    const { text: outputText } = getOutputPaths()

    // Export text version
    console.log('Exporting text version...')
    exportToText(chart, outputText)
    console.log(`✓ Text export completed: ${outputText}`)

    // Export images with different backgrounds
    const backgrounds: Array<'light' | 'dark'> = ['light', 'dark']

    for (const background of backgrounds) {
      console.log(`\nExporting ${background} background image...`)
      const outputImage = getOutputPaths().image.replace('.png', `-${background}.png`)
      await exportToImage(chart, {
        outputPath: outputImage,
        background,
        scale: EXAMPLE_CONFIG.DEFAULT_SCALE
      })
      console.log(`✓ ${background} image export completed: ${outputImage}`)
    }
    console.log('\n🎉 All exports completed successfully!')
    console.log(`Text: ${outputText}`)
    console.log('Images:')
    backgrounds.forEach(bg => {
      const imagePath = getOutputPaths().image.replace('.png', `-${bg}.png`)
      console.log(`  ${bg}: ${imagePath}`)
    })
  } catch (error) {
    console.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    process.exit(1)
  }
}

main().catch(error => {
  console.error(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  process.exit(1)
})
