import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from './interfaces/middleware.interface';

export class NotFoundMiddleware implements IMiddleware {
    constructor() {}

    execute(req: Request, res: Response, next: NextFunction): void {
        res.status(404).send({ message: 'Route not found' });
    }
}
