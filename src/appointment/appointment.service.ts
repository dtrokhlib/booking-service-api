import { injectable } from 'inversify';
import { Appointment } from './appointment.model';
import { AppointmentCreateDto } from './dto/appointment-create.dto';
import { IAppointmentDocument } from './interfaces/appointment.model.interface';
import { IAppointmentService } from './interfaces/appointment.service.interface';

@injectable()
export class AppointmentService implements IAppointmentService {
	async create(dto: AppointmentCreateDto): Promise<IAppointmentDocument | null> {
		const appointment = Appointment.build(dto);
		const isValid = await appointment.validateAppointmentDate();
		if (!isValid) {
			return null;
		}

		return appointment;
	}

	async getSingle(userId: string, appointmentId: string): Promise<IAppointmentDocument | null> {
		return await Appointment.findOne({
			_id: appointmentId,
			$or: [{ user: userId }, { doctor: userId }],
		});
	}

	async getAppointmentsByStatus(
		userId: string,
		status: string,
	): Promise<IAppointmentDocument[] | null> {
		return await Appointment.find({
			status,
			$or: [{ user: userId }, { doctor: userId }],
		});
	}

	getAssigned: (userId: string) => Promise<IAppointmentDocument[] | null>;

	statusUpdate: (status: string, id: string) => Promise<IAppointmentDocument | null>;
}
