/* eslint-disable @typescript-eslint/no-explicit-any */
enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
}

class Logger {
    private log(level: LogLevel, message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;

        switch (level) {
            case LogLevel.ERROR:
                console.error(logMessage, ...args);
                break;
            case LogLevel.WARN:
                console.warn(logMessage, ...args);
                break;
            case LogLevel.DEBUG:
                console.debug(logMessage, ...args);
                break;
            default:
                console.log(logMessage, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, message, ...args);
    }
}

export default new Logger();
