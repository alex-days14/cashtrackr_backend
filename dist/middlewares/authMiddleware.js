"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        res.status(401).json({ message: "No autorizado" });
        return;
    }
    const token = bearer.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token no válido" });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyJWT)(token);
        if (typeof decoded == "object" && decoded.id) {
            const user = await User_1.default.findByPk(decoded.id, {
                attributes: ["id", "name", "email"]
            });
            req.user = user;
            next();
        }
    }
    catch (error) {
        res.status(500).json({ message: "Token no válido" });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authMiddleware.js.map