// backend/src/utils/apiResponse.js
export class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      });
    }
  
    static error(res, message = 'Error', statusCode = 500, errors = null) {
      return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
      });
    }
  
    static paginated(res, data, total, page, limit) {
      return res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    }
  }