import { NextFunction, Request, Response } from "express"
import User from "../models/User"
import { verifyJWT } from "../utils/jwt"

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        res.status(401).json({ message: "No autorizado" })
        return
    }
    const token = bearer.split(" ")[1]

    if (!token) {
        res.status(401).json({ message: "Token no válido" })
        return
    }

    try {
        const decoded = verifyJWT(token)
        if (typeof decoded == "object" && decoded.id) {
            const user = await User.findByPk(decoded.id, {
                attributes: ["id", "name", "email"]
            })
            req.user = user
            next()
        }
    } catch (error) {
        res.status(500).json({ message: "Token no válido" })
    }
}