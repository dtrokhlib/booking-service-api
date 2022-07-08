import { injectable } from 'inversify';
import { IAppointmentDocument } from '../appointment/interfaces/appointment.model.interface';
import { IUserDocument } from '../users/interfaces/user.model.interface';
import { User } from '../users/user.model';
import { IReminderService } from './interfaces/reminder.service.interface';
import { scheduleJob } from 'node-schedule';
import moment from 'moment';
import fs from 'fs';

@injectable()
export class ReminderService implements IReminderService {
	async scheduleJob(appointment: IAppointmentDocument) {
		let timeDay = new Date();
		timeDay.setDate(timeDay.getDate() - 1);

		let time2Hours = new Date();
		time2Hours.setHours(time2Hours.getHours() - 2);

		const user = await User.findById(appointment.user);
		const doctor = await User.findById(appointment.doctor);

		if (!user || !doctor) {
			return;
		}

		jobCreation(timeDay, buildMessage1Day(user, doctor, appointment));
		jobCreation(time2Hours, buildMessage2Hours(user, doctor, appointment));
	}
}

function jobCreation(time: Date, message: string) {
	scheduleJob(time, function () {
		fs.appendFile('./log.txt', message, (err) => {
			if (err) {
				console.log(err);
			}
		});
	});
}

function buildMessage1Day(
	user: IUserDocument,
	doctor: IUserDocument,
	appointment: IAppointmentDocument,
) {
	const date = moment(appointment.date).format('h:mm');
	const currentDate = moment(new Date()).format('YYYY-MM-DD h:mm');
	return `${currentDate} | Привет ${user?.name}! Напоминаем что вы записаны к ${doctor?.spec} завтра в ${date}\n\n`;
}

function buildMessage2Hours(
	user: IUserDocument,
	doctor: IUserDocument,
	appointment: IAppointmentDocument,
): string {
	const date = moment(appointment.date).format('h:mm');
	const currentDate = moment(new Date()).format('YYYY-MM-DD h:mm');
	return `${currentDate} | Привет ${user?.name}! Вам через 2 часа к ${doctor?.spec} в ${date}\n\n`;
}
