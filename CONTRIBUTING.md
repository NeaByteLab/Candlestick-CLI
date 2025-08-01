# 🤝 Contributing to Candlestick-CLI

Thank you for your interest in contributing to Candlestick-CLI! This guide will help you get started.

## 🚀 Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/NeaByteLab/Candlestick-CLI.git
   cd Candlestick-CLI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

## 🔄 Development Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**
   - Follow the existing code style (2-space indentation, single quotes, no semicolons)
   - Add tests for new functionality
   - Update documentation as needed
   - Use TypeScript with strict mode
   - Add JSDoc comments for public APIs

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run format:check
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   ```
   Then create a pull request on GitHub.

## 🎨 Code Style

- Use 2-space indentation
- Use single quotes, no semicolons
- Use camelCase for variables/functions, PascalCase for classes/types
- Add JSDoc comments for all public functions
- Keep functions small and focused (max cognitive complexity of 15)
- Use TypeScript with strict mode enabled
- No `any` types, no unused variables

## 🧪 Testing

- Write unit tests for new functions
- Add integration tests for major features
- Ensure all tests pass before submitting
- Run `npm run check:all` for full quality check

## 📝 Commit Messages

Follow conventional commits format:

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `docs(scope): description` - Documentation changes
- `test(scope): description` - Test additions/changes
- `refactor(scope): description` - Code refactoring
- `style(scope): description` - Code style changes
- `perf(scope): description` - Performance improvements

## 📁 Project Structure

```
src/
├── chart/                 # Chart rendering components
├── core/                  # Core functionality (CCXT provider)
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── cli.ts                 # Command-line interface
├── constants.ts           # Constants and configuration
└── index.ts               # Main exports

examples/
├── simple-test.ts         # Real-time market data example
└── data/                  # Sample data files

docs/
├── api-reference.md       # Complete API documentation
├── examples.md            # Usage examples and patterns
└── README.md              # Documentation overview
```

## ⚙️ Available Scripts

```bash
# Development
npm run dev                # Run CLI in development mode
npm run candlestick-cli    # Run CLI tool
npm run example            # Run real-time market data example

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting

# Build & Test
npm run build              # Build TypeScript to dist/
npm run test               # Run Jest tests
npm run check:all          # Full quality check (lint + format + build)
```

## 🎯 Areas for Contribution

- **Chart Enhancements**: Add new chart types or visualization options
- **Data Providers**: Add support for more trading APIs
- **Performance**: Optimize chart rendering algorithms
- **Documentation**: Improve examples and guides
- **Bug Fixes**: Fix reported issues
- **CLI Features**: Add new command-line options
- **Color Schemes**: Add new color themes and customization

## ❓ Questions?

- Open an issue for discussion
- Check existing issues and PRs
- Follow the project's code of conduct

Thank you for contributing to Candlestick-CLI! 🎉