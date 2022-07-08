import { AppointmentCreateDto } from '../dto/appointment-create.dto';
import { IAppointmentDocument } from './appointment.model.interface';

export interface IAppointmentService {
	create: (dto: AppointmentCreateDto) => Promise<IAppointmentDocument | null>;
	getAppointmentsByStatus: (userId: string, type: string) => Promise<IAppointmentDocument[] | null>;
	getSingle: (userId: string, appointmentId: string) => Promise<IAppointmentDocument | null>;
	statusUpdate: (status: string, id: string) => Promise<IAppointmentDocument | null>;
}
