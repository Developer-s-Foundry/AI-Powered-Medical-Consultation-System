export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export class ResponseFormatter {
  /**
   * Success response
   */
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error response
   */
  static error(error: string, message?: string): ApiResponse {
    return {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
