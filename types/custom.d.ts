import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user: any;
        }
    }
}

declare module 'jsonwebtoken' {
    interface JwtPayload {
        id: string;
    }
}
