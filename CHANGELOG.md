# 📋 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-08-02

### Added
- **Export System** - Chart export functionality with multiple formats
  - PNG image export with canvas-based rendering
  - Text file export with optional ANSI color preservation
  - Format detection from file extension (.png, .txt)
  - Custom background themes (light/dark) for image export
  - Scalable image export (1x-4x scaling factors)
- **Modular CLI Architecture** - Complete CLI restructure
  - Separate modules for parser, validation, data, chart, output
  - Improved argument parsing with boolean flags
  - Better error handling with specific error types
  - Watch mode for live data updates with smooth UX
- **Canvas Rendering** - High-quality image generation
  - Direct candle drawing with proper rectangles and wicks
  - Price labels with theme-appropriate colors
  - Automatic dimension calculation with scaling
  - Professional chart layout with margins and padding
- **Auto-resize Functionality** - Dynamic terminal size detection
  - Automatic chart resizing on terminal changes
  - Configurable update intervals
  - Clean event listener management
- **Watch Mode** - Live data monitoring capabilities
  - Real-time chart updates with configurable intervals
  - Smooth console clearing with progress indicators
  - Graceful error recovery with retry mechanisms
  - Update counters and timing information

### Changed
- **Chart Rendering** - Improved candle sampling algorithms
  - Python-inspired intelligent sampling for large datasets
  - Better preservation of important data points
  - Improved terminal width calculation
  - Modular rendering functions for maintainability
- **Data Processing** - Restructured data handling
  - Improved CSV and JSON parsing with better validation
  - Market data conversion with automatic type determination
  - Better error messages with field-specific information
- **Core Utilities** - Expanded utility functions
  - Additional number formatting functions
  - Improved color validation and conversion
  - Better price rounding with configurable precision
- **Type System** - Extended TypeScript definitions
  - New export options interface
  - Better terminal size interface documentation
  - Improved error type definitions

### Fixed
- Terminal size detection edge cases
- Color validation for hex and RGB formats
- ANSI code handling in length calculations
- Canvas context type safety issues

## [1.0.0] - 2025-08-01

### Added
- **Initial Release** - Complete candlestick chart CLI tool and library
- **CLI Interface** - Command-line tool with comprehensive argument parsing
  - File input support for CSV and JSON formats
  - Custom color configuration (hex and RGB formats)
  - Chart dimension customization
  - Volume pane toggle and height configuration
  - Help system with detailed usage examples
- **Core Library** - TypeScript library for programmatic usage
  - `Chart` class with comprehensive API
  - Real-time data support via CCXT integration
  - Customizable colors and styling
  - Price highlighting system
  - Auto-resize terminal support
- **Chart Rendering** - Beautiful ASCII art visualization
  - Unicode candlestick characters for high-quality display
  - Volume pane with customizable height
  - Y-axis with price labels and highlighting
  - Info bar with statistics display
  - Multiple scaling modes (fit, fixed, price-based)
- **Data Processing** - Comprehensive data handling
  - CSV and JSON file parsing
  - Real-time market data fetching via CCXT
  - Candle data validation and error handling
  - Support for multiple timeframes and symbols
- **Error Handling** - Robust error management
  - Custom error classes for different scenarios
  - Descriptive error messages with helpful suggestions
  - Graceful fallbacks for invalid data
  - Validation for all input parameters
- **Documentation** - Comprehensive developer documentation
  - Complete JSDoc coverage for all functions and classes
  - Usage examples for complex functionality
  - API reference with detailed parameter descriptions
  - TypeScript type definitions for full IDE support
- **Development Tools** - Professional development setup
  - ESLint configuration with custom rules
  - Prettier formatting with consistent style
  - TypeScript compilation with strict mode
  - Build system with proper exports
  - Comprehensive testing setup

### Features
- **Terminal Optimization** - Designed specifically for terminal display
  - Auto-fit to terminal size
  - Responsive chart scaling
  - Unicode character support for crisp display
  - Color support for enhanced visualization
- **Trading Integration** - Real-time market data support
  - CCXT library integration for exchange data
  - Support for multiple exchanges and symbols
  - Perpetual futures data support
  - Configurable timeframes and limits
- **Customization** - Extensive configuration options
  - Custom bullish/bearish colors (RGB and hex)
  - Volume pane customization
  - Chart margins and scaling modes
  - Price highlighting with custom colors
- **Data Formats** - Flexible input support
  - CSV format with standard OHLCV columns
  - JSON format with array of candle objects
  - Real-time data from trading exchanges
  - Validation for data integrity and format

### Technical
- **TypeScript** - Full type safety and modern development
  - Strict TypeScript configuration
  - Comprehensive type definitions
  - IDE support with IntelliSense
  - Build-time error checking
- **Modular Architecture** - Clean, maintainable codebase
  - Separation of concerns (chart, utils, types, core)
  - Reusable components and utilities
  - Clear API boundaries
  - Extensible design for future enhancements
- **Performance** - Optimized for efficiency
  - Efficient chart rendering algorithms
  - Memory-conscious data processing
  - Fast terminal output
  - Minimal dependencies

### Documentation
- **README.md** - Comprehensive project overview
  - Installation and quick start guide
  - Usage examples for CLI and library
  - Feature highlights and capabilities
  - Related projects and references
- **API Documentation** - Detailed developer reference
  - Complete JSDoc coverage
  - Usage examples for all functions
  - Parameter descriptions and constraints
  - Error handling documentation
- **Examples** - Practical usage demonstrations
  - Simple test with real market data
  - CLI usage examples
  - Library integration examples
  - Sample data files

### Quality Assurance
- **Code Quality** - Professional development standards
  - ESLint with custom rules for consistency
  - Prettier formatting for clean code
  - TypeScript strict mode for type safety
  - Comprehensive error handling
- **Testing** - Robust testing infrastructure
  - Jest testing framework setup
  - Example tests with real data
  - Validation testing for all components
  - Error scenario testing
- **Build System** - Reliable build process
  - TypeScript compilation with aliases
  - Proper module exports
  - Development and production builds
  - Pre-commit hooks for quality

---

## Version History

### [1.1.0] - Major Feature Release (August 2, 2025)
- Export system with PNG and TXT formats
- Modular CLI architecture with separate modules
- Canvas-based image rendering
- Watch mode for live data updates
- Auto-resize functionality

### [1.0.0] - Initial Release (August 1, 2025)
- Complete candlestick chart CLI tool and library
- Real-time market data support via CCXT
- Beautiful ASCII art visualization with Unicode characters
- Comprehensive TypeScript library with full type safety
- Professional documentation and development tools

---

## Contributing

When contributing to this project, please update the changelog by adding a new entry under the [Unreleased] section. Follow the format above and include:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for security vulnerability fixes

## Links

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Project Repository](https://github.com/NeaByteLab/Candlestick-CLI)
- [NPM Package](https://www.npmjs.com/package/candlestick-cli) 