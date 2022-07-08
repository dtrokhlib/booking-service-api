import { UserLoginDto } from '../dto/user-login.dto';
import { UserRegisterDto } from '../dto/user-register.dto';
import { IUserDocument } from './user.model.interface';

export interface IUserService {
    createUser: (dto: UserRegisterDto) => Promise<IUserDocument | null>;
    validateUser: (dto: UserLoginDto) => Promise<IUserDocument | null>;
    getUserInfo: (email: string) => Promise<IUserDocument | null>;
}
