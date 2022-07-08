import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { isValidObjectId } from 'mongoose';
import { scheduleJob } from 'node-schedule';
import { AuthGuard } from '../common/auth.guard';
import { BaseController } from '../common/base.controller';
import { ValidateMiddleware } from '../common/validate.middleware';
import { HTTPError } from '../errors/http-error.class';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import {
	OUTDATED_DATETIME,
	USER_NOT_VALID,
	DOCTOR_NOT_VALID,
	TIME_NOT_AVAILABLE,
	APPOINTMENT_NOT_FOUND,
	NOT_VALID_OBJECT_ID,
	APPROVED_STATUS,
	DECLINED_STATUS,
	PENDING_STATUS,
	APPOINTMENT_ALREADY_PROCESSED,
    APPOINTMENT_OUT_OF_DATE,
} from './appointment.constants';
import { Appointment } from './appointment.model';
import { AppointmentCreateDto } from './dto/appointment-create.dto';
import { IAppointmentController } from './interfaces/appointment.controller.interface';
import { IAppointmentService } from './interfaces/appointment.service.interface';
import fs from 'fs';
import { User } from '../users/user.model';
import moment from 'moment';
import { IReminderService } from '../reminder/interfaces/reminder.service.interface';

@injectable()
export class AppointmentController extends BaseController implements IAppointmentController {
	constructor(
		@inject(TYPES.Logger) private loggerService: ILogger,
		@inject(TYPES.AppointmentService)
		private appointmentService: IAppointmentService,
		@inject(TYPES.ReminderService) private reminderService: IReminderService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/create',
				func: this.create,
				method: 'post',
				middlewares: [new AuthGuard(), new ValidateMiddleware(AppointmentCreateDto)],
			},
			{
				path: '/single/:id',
				func: this.getSingle,
				method: 'get',
				middlewares: [new AuthGuard()],
			},
			{
				path: '/status-update/:id',
				func: this.statusUpdate,
				method: 'put',
				middlewares: [new AuthGuard()],
			},
			{
				path: '/list/:status',
				func: this.getAppointmentsByStatus,
				method: 'get',
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async create(req: Request, res: Response, next: NextFunction) {
		const appointment = Appointment.build({
			...req.body,
			user: req.user.id,
		});

		const dateValidation = await appointment.validateAppointmentDate();
		if (!dateValidation) {
			return next(new HTTPError(OUTDATED_DATETIME, 422, 'appointment'));
		}

		const doctorValidation = await appointment.validateType('doc', appointment.doctor);
		if (!doctorValidation) {
			return next(new HTTPError(DOCTOR_NOT_VALID, 422, 'appointment'));
		}

		const userValidation = await appointment.validateType('user', appointment.user);
		if (!userValidation) {
			return next(new HTTPError(USER_NOT_VALID, 422, 'appointment'));
		}

		const isDoctorAvailable = await appointment.isDoctorAvailable();
		if (!isDoctorAvailable) {
			return next(new HTTPError(TIME_NOT_AVAILABLE, 422, 'appointment'));
		}

		await appointment.save();
		res.send(appointment);
	}

	async getSingle(req: Request, res: Response, next: NextFunction) {
		const { id: appointmentId } = req.params;
		const { id: userId } = req.user;

		if (!isValidObjectId(appointmentId)) {
			return next(new HTTPError(NOT_VALID_OBJECT_ID, 422, 'appointment'));
		}

		const appointment = await this.appointmentService.getSingle(userId, appointmentId);

		if (!appointment) {
			return next(new HTTPError(APPOINTMENT_NOT_FOUND, 422, 'appointment'));
		}

		res.send(appointment);
	}

	async statusUpdate(req: Request, res: Response, next: NextFunction) {
		const { id: appointmentId } = req.params;
		const { id: doctorId } = req.user;

		if (!isValidObjectId(appointmentId)) {
			return next(new HTTPError(NOT_VALID_OBJECT_ID, 422, 'appointment'));
		}

		const appointment = await this.appointmentService.getSingle(doctorId, appointmentId);

		if (!appointment || appointment.doctor !== doctorId || !appointment.active) {
			return next(new HTTPError(APPOINTMENT_NOT_FOUND, 422, 'appointment'));
		}

        if(!appointment.validateAppointmentDate()) {
            appointment.active = false;
            return next(new HTTPError(APPOINTMENT_OUT_OF_DATE, 422, 'appointment'));
        }

		if (appointment.status !== PENDING_STATUS) {
			return next(new HTTPError(APPOINTMENT_ALREADY_PROCESSED, 422, 'appointment'));
		}

		if (req.body.status == APPROVED_STATUS) {
			appointment.status = APPROVED_STATUS;
			this.reminderService.scheduleJob(appointment);
			await appointment.save();
		} else if (req.body.status == DECLINED_STATUS) {
			appointment.status = DECLINED_STATUS;
			await appointment.remove();
		}

		res.send(appointment);
	}

	async getAppointmentsByStatus(req: Request, res: Response, next: NextFunction) {
		const { status } = req.params;
		const { id: userId } = req.user;

		const appointments = await this.appointmentService.getAppointmentsByStatus(userId, status);

		res.send(appointments);
	}
}
