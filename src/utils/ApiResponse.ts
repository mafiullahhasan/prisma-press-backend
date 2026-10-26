class ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
    };

    constructor(
        statusCode: number,
        data: T,
        message: string = 'Success',
        meta?: { page: number; limit: number; total: number }
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode < 400;
        this.data = data;
        if (meta) {
            this.meta = meta;
        }
    }
}

export { ApiResponse };