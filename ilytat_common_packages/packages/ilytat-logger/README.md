# @ilytat/logger

Enterprise-grade structured logging system for ILYTAT services.

## Features

- **Structured JSON Logging**: Optimized for cloud queryability.
- **Log Levels**: Trace, Debug, Info, Warn, Error, Fatal.
- **Context Awareness**: Automatically attaches request IDs and timestamps.
- **Transports**: Extensible transport system (Console, File, etc.).

## Installation

```bash
npm install @ilytat/logger
```

## Usage

```typescript
import { Logger } from '@ilytat/logger';

const logger = new Logger({
  minLevel: 'info',
  serviceName: 'my-service'
});

logger.info('Server started', { port: 3000 });

try {
  // ... operation
} catch (e) {
  logger.error('Operation failed', { error: e });
}
```
