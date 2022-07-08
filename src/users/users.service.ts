import { injectable } from 'inversify';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { IUserDocument } from './interfaces/user.model.interface';
import { IUserService } from './interfaces/user.service.interface';
import { User } from './user.model';

@injectable()
export class UserService implements IUserService {
    async createUser(data: UserRegisterDto): Promise<IUserDocument | null> {
        const existedUser = await User.findOne({ email: data.email });
        if (existedUser) {
            return null;
        }

        const user = User.build(data);
        await user.save();

        return user;
    }

    async validateUser({
        email,
        password,
    }: UserLoginDto): Promise<IUserDocument | null> {
        const user = await User.findOne({ email });
        if (!user) {
            return null;
        }

        const isPasswordValid = user.passwordCompare(password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async getUserInfo(email: string): Promise<IUserDocument | null> {
        return await User.findOne({ email });
    }
}
