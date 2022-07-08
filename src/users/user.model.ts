import mongoose from 'mongoose';
import {
    IUser,
    IUserDocument,
    IUserModel,
    userType,
} from './interfaces/user.model.interface';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        req_token: String,
        photo: String,
        phone: { type: String, required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: userType,
            required: true,
        },
        spec: String
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret.password;
                delete ret.__v;
                delete ret._id;
            },
        },
    }
);

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS!));
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    }
});

userSchema.methods.passwordCompare = async function (
    password: string
): Promise<boolean> {
    const user = this;
    return await bcrypt.compare(user.password, password);
};

userSchema.methods.tokenGenerate = async function () {
    const user = this;
    return jwt.sign({ id: user._id }, process.env.SECRET!);
};

userSchema.statics.tokenVerify = async (
    token: string
): Promise<null | string | JwtPayload> => {
    try {
        return await jwt.verify(token, process.env.SECRET!);
    } catch (err) {
        return null;
    }
};

userSchema.statics.build = (user: IUser): IUserDocument => {
    return new User(user);
};

export const User = mongoose.model<IUserDocument, IUserModel>(
    'User',
    userSchema
);
