export * from './types';
export * from './transports/ConsoleTransport';
export * from './Logger';

import { Logger } from './Logger';

// Default singleton instance
export const logger = Logger.getInstance();
