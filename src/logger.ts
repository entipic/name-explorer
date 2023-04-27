export interface ILogger {
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}

export const logger: ILogger = {
  error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  },
  info(message?: any, ...optionalParams: any[]) {
    console.info(message, ...optionalParams);
  },
  warn(message?: any, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
  }
};
