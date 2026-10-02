import { Request, Response, NextFunction } from "express";
import { aj } from '../config/arcject.js';
import { slidingWindow } from "@arcjet/node";

type RateLimitRole = 'admin' | 'teacher' | 'student' | 'guest';

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test") return next();

    try {
        // Fix for req.user typing and student role casing
        const userRole = (req as any).user?.role;
        const role: RateLimitRole = userRole === 'students' ? 'student' : (userRole ?? 'guest');

        let limit: number;
        let message: string;

        switch (role) {
            case 'admin':
                limit = 20;
                message = "Admin Request Exceeded (20 per minute), slow down";
                break;
            case 'teacher':
            case 'student':
                limit = 10;
                message = "User request Exceeded (10 requests per minute), please wait";
                break;
            default:
                limit = 5;
                message = "Guest Request Exceeded (5 requests per minute), please sign up for higher limits";
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '1m',
                max: limit
            })
        );

        // `aj` includes a token-bucket rule, which requires the number of
        // tokens requested for every protected request.
        const decision = await client.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isBot()) {
                return res.status(403).json({ error: "Forbidden", message: "Automated requests are not allowed" });
            }
            if (decision.reason.isShield()) {
                return res.status(403).json({ error: "Forbidden", message: "Request blocked by security policy" });
            }
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: "Too Many Requests", message });
            }
        }

        next();
    } catch (e) {
        console.log("Security middleware error:", e);
        res.status(500).json({ error: "Internal error", message: "Something went wrong with security middleware" });
    }
};

export default securityMiddleware;
