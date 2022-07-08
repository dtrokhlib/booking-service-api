import mongoose from 'mongoose';
import { User } from '../users/user.model';
import {APPROVED_STATUS, MAX_VISITS_PER_DAY } from './appointment.constants';
import {
	appointmentStatus,
	IAppointment,
	IAppointmentDocument,
	IAppointmentModel,
} from './interfaces/appointment.model.interface';

const appointmentSchema = new mongoose.Schema(
	{
		date: { type: Date, required: true },
		user: { type: String, required: true },
		doctor: { type: String, required: true },
		status: {
			type: String,
			enum: appointmentStatus,
			default: appointmentStatus[0],
		},
		active: { type: Boolean, default: true },
	},
	{
		toJSON: {
			transform: function (doc, ret) {
				ret.id = ret._id;
				delete ret.__v;
				delete ret._id;
			},
		},
	},
);

appointmentSchema.pre('save', async function () {
	this.date = new Date(this.date);
});

appointmentSchema.statics.build = (appointment: IAppointment): IAppointmentDocument => {
	return new Appointment(appointment);
};

appointmentSchema.methods.validateAppointmentDate = async function () {
	const appointmentDate = new Date(this.date);
	const currentDate = new Date();

	if (currentDate.getTime() > appointmentDate.getTime()) {
		return false;
	}

	return true;
};

appointmentSchema.methods.isDoctorAvailable = async function () {
	const appointmentDate = new Date(this.date);

	const date = {
		year: appointmentDate.getUTCFullYear(),
		month: appointmentDate.getUTCMonth(),
		day: appointmentDate.getUTCDate(),
	};

	const currentVisits = await Appointment.countDocuments({
		date: {
			$gte: new Date(date.year, date.month, date.day),
			$lte: new Date(date.year, date.month, date.day + 1),
		},
		doctor: this.doctor,
		status: APPROVED_STATUS,
	});

	if (currentVisits >= MAX_VISITS_PER_DAY) {
		return false;
	}

	return true;
};

appointmentSchema.methods.validateType = async function (type: string, id: string) {
	const doctorIsExist = await User.findById(id);
	if (!doctorIsExist || doctorIsExist.type != type) {
		return false;
	}
	return true;
};

appointmentSchema.methods.isUser = async function () {};

export const Appointment = mongoose.model<IAppointmentDocument, IAppointmentModel>(
	'Appointment',
	appointmentSchema,
);
