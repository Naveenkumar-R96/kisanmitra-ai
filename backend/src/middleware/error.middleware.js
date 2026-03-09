// backend/src/middleware/error.middleware.js
export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
  
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
      statusCode = 400;
      message = err.errors.map(e => e.message).join(', ');
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }
  
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error:', err);
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  export class AppError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
    }
  }