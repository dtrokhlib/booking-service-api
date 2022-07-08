import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { LoggerService } from './logger/logger.service';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { ExeptionFilter } from './errors/exeption.filter';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { IUserController } from './users/interfaces/user.controller.interface';
import { IUserService } from './users/interfaces/user.service.interface';
import { UserController } from './users/users.controller';
import { UserService } from './users/users.service';
import 'dotenv/config';
import { IAppointmentController } from './appointment/interfaces/appointment.controller.interface';
import { IAppointmentService } from './appointment/interfaces/appointment.service.interface';
import { AppointmentController } from './appointment/appointment.controller';
import { AppointmentService } from './appointment/appointment.service';
import { IReminderService } from './reminder/interfaces/reminder.service.interface';
import { ReminderService } from './reminder/reminder.service';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.Logger).to(LoggerService).inSingletonScope();
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<IUserService>(TYPES.UserService).to(UserService);
	bind<IAppointmentController>(TYPES.AppointmentController).to(AppointmentController);
	bind<IAppointmentService>(TYPES.AppointmentService).to(AppointmentService);
	bind<IReminderService>(TYPES.ReminderService).to(ReminderService);
	bind<App>(TYPES.Application).to(App).inSingletonScope();
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();

	return { appContainer, app };
}

export const boot = bootstrap();
