import { IsEmail, IsString, IsIn } from 'class-validator';
import { userType, UserType } from '../interfaces/user.model.interface';

export class UserRegisterDto {
    @IsEmail({}, { message: 'Not valid email' })
    email: string;

    @IsString({ message: 'Password is not specified' })
    password: string;

    @IsString({ message: 'Phone is not specified' })
    phone: string;

    @IsString({ message: 'Name is not specified' })
    name: string;

    @IsIn(userType)
    type: UserType;
}
