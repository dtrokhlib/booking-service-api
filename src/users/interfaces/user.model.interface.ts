import { JwtPayload } from 'jsonwebtoken';
import { Model, Document } from 'mongoose';

export const userType = ['user', 'doc'];
export type UserType = 'user' | 'doc';

export interface IUser {
    email: string;
    password: string;
    req_token?: string;
    photo?: string;
    phone: string;
    name: string;
    type: UserType;
    spec?: string;
}

export interface IUserDocument extends Document, IUser {
    tokenGenerate: () => Promise<string>;
    passwordCompare: (password: string) => Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
    build: (user: IUser) => IUserDocument;
    tokenVerify: (token: string) => Promise<null | string | JwtPayload>;
}
