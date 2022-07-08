import { Router } from 'express';
import { IControllerRoute } from './interfaces/route.interface';
import { injectable } from 'inversify';
import { ILogger } from '../logger/logger.interface';
import 'reflect-metadata';

@injectable()
export abstract class BaseController {
    private readonly _router: Router;

    constructor(private logger: ILogger) {
        this._router = Router();
    }

    get router(): Router {
        return this._router;
    }

    protected bindRoutes(routes: IControllerRoute[]): void {
        for (const route of routes) {
            this.logger.log(`[${route.method}] ${route.path}`);
            const middleware = route.middlewares?.map((m) => m.execute.bind(m));
            const handler = route.func.bind(this);
            const pipeline = middleware ? [...middleware, handler] : handler;
            this.router[route.method](route.path, pipeline);
        }
    }
}
