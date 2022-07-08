import { IsString, IsDateString } from 'class-validator';

export class AppointmentCreateDto {
    @IsDateString({ message: 'Not valid date' })
    date: string;

    user: string;

    @IsString({ message: 'Doctor is not specified' })
    doctor: string;
}
