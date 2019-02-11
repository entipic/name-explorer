
let _logger: ILogger = console;

interface ILogger {
	info(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
	error(message?: any, ...optionalParams: any[]): void;
}

export const logger: ILogger = {
	info() {
		_logger.info.apply(_logger, arguments as any);
	},
	warn() {
		_logger.warn.apply(_logger, arguments as any);
	},
	error() {
		_logger.error.apply(_logger, arguments as any);
	}
}

export function setLogger(l: ILogger) {
	_logger = l;
}
