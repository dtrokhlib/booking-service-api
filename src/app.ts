import 'reflect-metadata';
import express, { Request, Response, Express } from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { UserController } from './users/users.controller';
import mongoose from 'mongoose';
import { NotFoundMiddleware } from './common/not-found.middleware';
import { AppointmentController } from './appointment/appointment.controller';
import { AuthMiddleware } from './common/auth.middleware';

@injectable()
export class App {
    app: Express;
    server: Server;
    port: number;

    constructor(
        @inject(TYPES.Logger) private logger: ILogger,
        @inject(TYPES.UserController) private userController: UserController,
        @inject(TYPES.AppointmentController)
        private appointmentController: AppointmentController,
        @inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter
    ) {
        this.app = express();
        this.port = 8000;
    }

    useMiddleware(): void {
        this.app.use(express.json());
    }

    useRoutes(): void {
        const authMiddleware = new AuthMiddleware();
        this.app.use(authMiddleware.execute.bind(authMiddleware));

        this.app.use('/api/users', this.userController.router);
        this.app.use('/api/appointments', this.appointmentController.router);

        const notFoundMiddleware = new NotFoundMiddleware();
        this.app.use(notFoundMiddleware.execute.bind(notFoundMiddleware));
    }

    useExeptionFilters(): void {
        this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
    }

    public async init(): Promise<void> {
        this.useMiddleware();
        this.useRoutes();
        this.useExeptionFilters();

        mongoose.connect(process.env.MONGO_URL!);

        this.server = this.app.listen(this.port);
        this.logger.log(`Server is running on http://localhost:${this.port}`);
    }

    public close(): void {
        this.server.close();
    }
}
