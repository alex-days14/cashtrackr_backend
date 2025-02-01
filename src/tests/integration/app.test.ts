import request from "supertest";
import server from "../../server";
import { UserController } from "../../controllers/UserController";
import User from "../../models/User";
import * as authUtils from "../../utils/auth";
import * as jwtUtils from "../../utils/jwt";

describe("Authentication - Create Account", () => {
    it("should return validation errors if form is empty", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({  })

        const createAccountMock = jest.spyOn(UserController, "createAccount")
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(6)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it("should return 400 if email is invalid", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({ name: "John Doe", email: "correocorreo.com", password: "password" })

        const createAccountMock = jest.spyOn(UserController, "createAccount")
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(1)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it("should return 400 if password length is less than 8 characters", async () => {
        const res = await request(server)
            .post("/api/auth/register")
            .send({ name: "John Doe", email: "test@test.com", password: "short" })

        const createAccountMock = jest.spyOn(UserController, "createAccount")
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(1)
        expect(res.body.errors[0].msg).toBe("La contraseña debe tener al menos 6 caracteres")
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it("should return 201 when user account is created successfully", async () => {
        const userForm = { 
            name: "John Doe", 
            email: "test@test.com", 
            password: "password" 
        }
        const res = await request(server)
            .post("/api/auth/register")
            .send(userForm)
        
        expect(res.status).toBe(201)

        expect(res.body).not.toHaveProperty("errors")
    })

    it("should return 409 if an email is already registered", async () => {
        const userForm = { 
            name: "John Doe", 
            email: "test@test.com", 
            password: "password" 
        };
        const res = await request(server)
            .post("/api/auth/register")
            .send(userForm);
        
        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("El correo electrónico ya está en uso")

        expect(res.status).not.toBe(400)
        expect(res.status).not.toBe(201)
        expect(res.body).not.toHaveProperty("errors")
    })
})

describe('Authentication - Confirm Account', () => {
    it("should return errors if token is empty or is not valid", async () => {
        const formData = {
            token: ""
        }
        const res = await request(server)
            .post("/api/auth/confirm-account")
            .send(formData)

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(2)
    })

    it("should return 404 if a user with that token does not exist", async () => {
        const formData = {
            token: "123456"
        }
        const res = await request(server)
            .post("/api/auth/confirm-account")
            .send(formData)

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Token no válido")

        expect(res.status).not.toBe(200)
    })

    it("should confirm an account with valid token", async () => {
        const formData = {
            token: globalThis.cashTrackrConfirmationToken
        }
        const res = await request(server)
            .post("/api/auth/confirm-account")
            .send(formData)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Usuario confirmado exitosamente")

        expect(res.status).not.toBe(500)
    })
})

describe('Authentication - Login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return errors if form is empty", async () => {
        const formData = {
            email: "",
            password: ""
        }
        const res = await request(server)
            .post("/api/auth/login")
            .send(formData)

        const loginMock = jest.spyOn(UserController, "login")

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(4)

        expect(loginMock).not.toHaveBeenCalled()
    })

    it("should return errors if and invalid email was received", async () => {
        const formData = {
            email: "notvalidgamil.com",
            password: "password1234"
        }
        const res = await request(server)
            .post("/api/auth/login")
            .send(formData)

        const loginMock = jest.spyOn(UserController, "login")

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(1)

        expect(loginMock).not.toHaveBeenCalled()
    })

    it("should return 404 if user does not exist with that email", async () => {
        const formData = {
            email: "notregistered@gmail.com",
            password: "Test123456"
        }
        const res = await request(server)
            .post("/api/auth/login")
            .send(formData)

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Parece que hay un error en el email o contraseña")

        expect(res.status).not.toBe(200)
    })

    it("should return 403 if user is not confirmed yet", async () => {
        (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({ 
            id: 1,
            confirmed: false,
            password: "hashedPassword",
            email: "notconfirmed@gmail.com" 
        })
        const formData = {
            email: "notconfirmed@gmail.com",
            password: "password"
        }
        const res = await request(server)
            .post("/api/auth/login")
            .send(formData)

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Aún no has confirmado tu cuenta, revisa tu email")

        expect(res.status).not.toBe(200)
    })

    it("should return 403 if user is not confirmed yet", async () => {
        const registerData = {
            name: "notconfirmed",
            email: "notconfirmed@gmail.com",
            password: "password"
        }
        await request(server)
            .post("/api/auth/register")
            .send(registerData)
        
        const res = await request(server)
            .post("/api/auth/login")
            .send({ email: registerData.email, password: registerData.password })

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Aún no has confirmado tu cuenta, revisa tu email")

        expect(res.status).not.toBe(200)
    })

    it("should return 401 if password does not match with actual one", async () => {
        const findOne = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({ 
            id: 1,
            confirmed: true,
            password: "hashedPassword",
            email: "notconfirmed@gmail.com" 
        });
        const comparePassword = jest.spyOn(authUtils, "comparePassword").mockResolvedValue(false);
        const formData = {
            email: "notconfirmed@gmail.com",
            password: "wrongPassword"
        }
        const res = await request(server)
            .post("/api/auth/login")
            .send(formData);

        expect(findOne).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Parece que hay un error en el email o contraseña")

        expect(res.status).not.toBe(200)
    })

    it("should return the jwt token and 200 status", async () => {
        const findOne = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({ 
            id: 1,
            confirmed: true,
            password: "hashedPassword",
            email: "test@gmail.com" 
        });
        const comparePassword = jest.spyOn(authUtils, "comparePassword").mockResolvedValue(true);
        const generateJWT = jest.spyOn(jwtUtils, "generateJWT").mockReturnValue("jwtToken");
        const formData = {
            email: "test@gmail.com",
            password: "password"
        }
        const res = await request(server)
            .post("/api/auth/login")
            .send(formData);

        expect(findOne).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith(formData.password, "hashedPassword")
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(1)
        expect(res.status).toBe(200)
        expect(res.body).toBe("jwtToken")

        expect(res.status).not.toBe(500)
    })
})

let jwt: string
async function authenticateUser(){
    const res = await request(server).post("/api/auth/login").send({
        email: "test@test.com",
        password: "password"
    })
    jwt = res.body
}

describe("GET /api/budgets", () => {
    
    beforeAll(() => {
        jest.restoreAllMocks() // restaurar las funciones de los jest.spy a su implementación original
    })
    beforeAll(async () => {
        await authenticateUser()
    })

    it("should reject unauthenticated requests", async () => {
        const res = await request(server).get("/api/budgets")
        
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("No autorizado")
    })

    it("should reject invalid jwt tokens", async () => {
        const res = await request(server).get("/api/budgets").auth("invalidjwt", { type: "bearer" })

        expect(res.status).toBe(500)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Token no válido")
    })

    it("should allow users with valid jwt", async () => {
        const res = await request(server).get("/api/budgets").auth(jwt, { type: "bearer" })

        expect(res.body).toHaveLength(0)

        expect(res.status).not.toBe(500)
    })
})

describe("POST /api/budgets", () => {
    beforeAll(async () => {
        await authenticateUser()
    })

    it("should reject unauthenticated requests", async () => {
        const res = await request(server).post("/api/budgets")
        
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("No autorizado")
    })

    it("should return errors if form is empty", async () => {
        const res = await request(server).post("/api/budgets").send({
            name: "",
            amount: ""
        }).auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(4)
    })

    it("should create new budget for the authenticated user", async () => {
        const res = await request(server).post("/api/budgets").send({
            name: "Test Budget",
            amount: 123456
        }).auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Presupuesto creado exitosamente")

        expect(res.status).not.toBe(400)
        expect(res.body).not.toHaveProperty("errors")
    })
})

describe("GET /api/budgets/:budgetId", () => {
    beforeAll(async () => {
        await authenticateUser()
    })

    it("should reject unauthenticated requests", async () => {
        const res = await request(server).get("/api/budgets/1")
        
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("No autorizado")
    })

    it("should return errors if budgetId params is invalid", async () => {
        const res = await request(server).get("/api/budgets/hola").auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
        expect(res.body.errors).toHaveLength(2)
    })

    it("should return 404 if budget does not exist", async () => {
        const res = await request(server).get("/api/budgets/3000").auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Presupuesto no encontrado")
    })

    /* it("should return 401 if user do not have access to the budget", async () => {
        const res = await request(server).get("/api/budgets/2").auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Presupuesto no encontrado")
    }) */

    it("should return a budget by its id", async () => {
        const res = await request(server).get("/api/budgets/1").auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(200)
        expect(res.body).not.toHaveProperty("message")
    })
})

describe("PUT /api/budgets/:budgetId", () => {
    beforeAll(async () => {
        await authenticateUser()
    })

    it("should reject unauthenticated requests", async () => {
        const res = await request(server).put("/api/budgets/1")
        
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("No autorizado")
    })

    it("should return errors if form is empty", async () => {
        const res = await request(server).put("/api/budgets/1").auth(jwt, { type: "bearer" }).send({
            name: "",
            amount: ""
        })
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("errors")
    })

    it("should edit an existent budget and send a success message", async () => {
        const res = await request(server).put("/api/budgets/1").auth(jwt, { type: "bearer" }).send({
            name: "Test ACTUALIZADO",
            amount: 654321
        })
        
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Presupuesto editado exitosamente")
    })
})

describe("DELETE /api/budgets/:budgetId", () => {
    beforeAll(async () => {
        await authenticateUser()
    })

    it("should reject unauthenticated requests", async () => {
        const res = await request(server).delete("/api/budgets/1")
        
        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("No autorizado")
    })

    it("should delete an existent budget and send a success message", async () => {
        const res = await request(server).delete("/api/budgets/1").auth(jwt, { type: "bearer" })
        
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("message")
        expect(res.body.message).toBe("Presupuesto eliminado exitosamente")
    })
})