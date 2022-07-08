import { IAppointmentDocument } from '../../appointment/interfaces/appointment.model.interface';
import { IUserDocument } from '../../users/interfaces/user.model.interface';

export interface IReminderService {
	scheduleJob: (appointment: IAppointmentDocument) => void;
}