import jwt from 'jsonwebtoken';
export declare const generateJWT: (id: string) => string;
export declare const verifyJWT: (token: string) => string | jwt.JwtPayload;
