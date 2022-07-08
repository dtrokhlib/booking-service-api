import 'reflect-metadata';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { IUserController } from './interfaces/user.controller.interface';
import { BaseController } from '../common/base.controller';
import { NextFunction, Response, Request } from 'express';
import { injectable, inject } from 'inversify';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUserService } from './interfaces/user.service.interface';
import { HTTPError } from '../errors/http-error.class';
import { ValidateMiddleware } from '../common/validate.middleware';
import { INVALID_CREDENTIALS, USER_EXIST } from './user.constants';

@injectable()
export class UserController extends BaseController implements IUserController {
    constructor(
        @inject(TYPES.Logger) private loggerService: ILogger,
        @inject(TYPES.UserService) private userService: IUserService
    ) {
        super(loggerService);
        this.bindRoutes([
            {
                path: '/login',
                func: this.login,
                method: 'post',
                middlewares: [new ValidateMiddleware(UserLoginDto)],
            },
            {
                path: '/register',
                func: this.register,
                method: 'post',
                middlewares: [new ValidateMiddleware(UserRegisterDto)],
            },
        ]);
    }

    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const user = await this.userService.validateUser(req.body);
        if (!user) {
            return next(new HTTPError(INVALID_CREDENTIALS, 422, 'login'));
        }

        user.req_token = await user.tokenGenerate();
        await user.save();

        res.send({ user });
    }

    async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const user = await this.userService.createUser(req.body);
        if (!user) {
            return next(new HTTPError(USER_EXIST, 422, 'register'));
        }

        user.req_token = await user.tokenGenerate();
        await user.save();

        res.status(201).send({ user });
    }
}
