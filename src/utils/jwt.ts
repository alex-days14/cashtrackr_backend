import jwt from 'jsonwebtoken';

export const generateJWT = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });
}

export const verifyJWT = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}