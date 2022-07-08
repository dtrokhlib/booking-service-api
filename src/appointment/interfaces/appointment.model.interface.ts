import { Model, Document } from 'mongoose';

export const appointmentStatus = ['pending', 'approved', 'declined'];
type AppointmentStatus = 'pending' | 'approved' | 'declined';

export interface IAppointment {
    date: string;
    user: string;
    doctor: string;
    status?: AppointmentStatus;
    active?: boolean;
}

export interface IAppointmentDocument extends Document, IAppointment {
    validateAppointmentDate: () => boolean;
    isDoctorAvailable: () => boolean;
    validateType: (type: string, id: string) => boolean;
}

export interface IAppointmentModel extends Model<IAppointmentDocument> {
    build: (appointment: IAppointment) => IAppointmentDocument;
}
