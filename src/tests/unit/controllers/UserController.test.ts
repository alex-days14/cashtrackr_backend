import { createRequest, createResponse } from "node-mocks-http";
import User from "../../../models/User";
import { UserController } from "../../../controllers/UserController";
import { AuthEmail } from "../../../emails/AuthEmail";
import { comparePassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User")
jest.mock("../../../utils/auth")
jest.mock("../../../utils/token")
jest.mock("../../../utils/jwt")

describe('UserController.createAccount', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should return 409 if user already exists", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(true)
        const req = createRequest({
            method: 'POST',
            url: "/api/auth/register",
            body: {
                email: "test@test.com",
                password: "Password123"
            }
        })
        const res = createResponse()

        await UserController.createAccount(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(409)
        expect(data).toEqual({ message: "El correo electrónico ya está en uso" })
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.create).not.toHaveBeenCalled()
    })

    it("should create a new user, send confirmation email and return a success message", async () => {
        const req = createRequest({
            method: 'POST',
            url: "/api/auth/register",
            body: {
                email: "test@test.com",
                password: "Password123",
                name: "Test User"
            }
        })
        const res = createResponse();

        const userMock = {
            ...req.body,
            save: jest.fn(), 
        };
        (User.create as jest.Mock).mockResolvedValue(userMock);
        (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
        (generateToken as jest.Mock).mockReturnValue("123456");
        jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve())

        await UserController.createAccount(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(201)
        expect(data).toEqual({ message: "Usuario creado exitosamente" })
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(userMock.password).toBe("hashedPassword")
        expect(userMock.token).toBe("123456")
        expect(userMock.save).toHaveBeenCalled()
        expect(userMock.save).toHaveBeenCalledTimes(1)
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({ name: req.body.name, email: req.body.email, token: "123456" })
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
    })
})

describe('UserController.login', () => {
    it("should return 404 if user does not exist", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null)
        const req = createRequest({
            method: 'POST',
            url: "/api/auth/login",
            body: {
                email: "test@test.com",
                password: "Password123"
            }
        })
        const res = createResponse()

        await UserController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toEqual({ message: "Parece que hay un error en el email o contraseña" })
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } })
    })

    it("should return 403 if user is not confirmed", async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: "test@test.com",
            password: "Password123",
            confirmed: false,
        })
        const req = createRequest({
            method: 'POST',
            url: "/api/auth/login",
            body: {
                email: "test@test.com",
                password: "Password123"
            }
        })
        const res = createResponse()

        await UserController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(403)
        expect(data).toEqual({ message: "Aún no has confirmado tu cuenta, revisa tu email" })
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } })
    })

    it("should return 401 if password is incorrect", async () => {
        const userMock = {
            id: 1,
            email: "test@test.com",
            password: "Password1234",
            confirmed: true,
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        const req = createRequest({
            method: 'POST',
            url: "/api/auth/login",
            body: {
                email: "test@test.com",
                password: "Password123"
            }
        });
        const res = createResponse();

        (comparePassword as jest.Mock).mockResolvedValue(false)

        await UserController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toEqual({ message: "Parece que hay un error en el email o contraseña" })
        expect(comparePassword).toHaveBeenCalledWith(req.body.password, userMock.password)
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } })
    })

    it("should return a JWT if login is successful", async () => {
        const userMock = {
            id: 1,
            email: "test@test.com",
            password: "Password123",
            confirmed: true,
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        const req = createRequest({
            method: 'POST',
            url: "/api/auth/login",
            body: {
                email: "test@test.com",
                password: "Password123"
            }
        });
        const res = createResponse();

        const fakejwt = "ey123chsddvf445ccdssaadwsxrcsdgfef";
        (comparePassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(fakejwt);

        await UserController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(fakejwt)
        expect(generateJWT).toHaveBeenCalledWith(userMock.id)
        expect(generateJWT).toHaveBeenCalledTimes(1)
    })
})
