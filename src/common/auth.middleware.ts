import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { IMiddleware } from './interfaces/middleware.interface';

export class AuthMiddleware implements IMiddleware {
    constructor() {}

    execute(req: Request, res: Response, next: NextFunction): void {
        if (req.headers.authorization) {
            verify(
                req.headers.authorization.split(' ')[1],
                process.env.SECRET!,
                (err, payload) => {
                    if (err) {
                        next();
                    } else if (payload) {
                        req.user = payload;
                        next();
                    }
                }
            );
        } else {
            next();
        }
    }
}
