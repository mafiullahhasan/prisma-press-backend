import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../generated/prisma/client';
import { ApiError } from '../utils/ApiError';

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;

    // ১. Prisma Validation Errors (টাইপ মিসম্যাচ বা ইনপুট ডাটা ফরম্যাট ভুল হলে)
    if (err instanceof Prisma.PrismaClientValidationError) {
        const lines = err.message.split('\n');
        const cleanMessage = lines
            .filter((line) => line.includes('Argument') || line.includes('Unknown arg') || line.includes('Expected'))
            .map((line) => line.trim())
            .join(' | ') || 'Database validation failed. Please check your input fields.';

        error = new ApiError(httpStatus.BAD_REQUEST, cleanMessage, [], err.stack);
    }

    // ২. Prisma Known Request Errors হ্যান্ডেল করা (যেমন: Unique constraint fail, findUniqueOrThrow fail)
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        let statusCode
        let message = err.message;

        switch (err.code) {
            case 'P2002': // Unique constraint failed
                statusCode = httpStatus.CONFLICT; // 409
                const target = (err.meta?.target as string[])?.join(', ') || 'Field';
                message = `${target.charAt(0).toUpperCase() + target.slice(1)} already exists. Please use a unique value.`;
                break;

            case 'P2025': // findUniqueOrThrow বা ডিলিট করার সময় রেকর্ড না পাওয়া গেলে
                statusCode = httpStatus.NOT_FOUND; // 404
                message = err.meta?.cause
                    ? String(err.meta.cause).replace('to update ', '')
                    : 'The requested record was not found.';
                break;

            case 'P2003': // Foreign key constraint failed
                statusCode = httpStatus.BAD_REQUEST; // 400
                message = 'Database relation error. Foreign key constraint failed.';
                break;

            default:
                message = `Database request error: ${err.message}`;
                break;
        }

        error = new ApiError(statusCode || httpStatus.BAD_REQUEST, message, [], err.stack);
    }

    // ৩. Prisma Initialization Error (ডাটাবেজ কানেকশন ডাউন থাকলে বা ক্রেডিশিয়াল ভুল হলে)
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        error = new ApiError(
            httpStatus.SERVICE_UNAVAILABLE, // 503
            'Database server is unavailable or connection failed.',
            [],
            err.stack
        );
    }

    // ৪. Prisma Unknown Request Error (Prisma ইঞ্জিনের অভ্যন্তরীণ কোনো ভুল)
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        error = new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR, // 500
            'An unknown database error occurred.',
            [],
            err.stack
        );
    }

    // ৫. অন্যান্য Unhandled/Standard JavaScript বা ম্যানুয়াল ApiError হলে রূপান্তর
    else if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error.status || httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, [], err.stack);
    }

    // ডেভেলপমেন্ট মোডে ফুল এরর কনসোলে লগ করা
    if (process.env.NODE_ENV === 'development') {
        console.error('--- Global Error Logger ---');
        console.error(err);
    }

    res.status(error.statusCode).json({
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};

export { errorHandler };
