import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: process.env.NODE_ENV !== "production" ? 100 : 5,
    message: { message: "Has alcanzado el límite de peticiones" }
})