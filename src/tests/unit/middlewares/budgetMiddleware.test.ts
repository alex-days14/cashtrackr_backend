import { createRequest, createResponse } from "node-mocks-http"
import { hasAccess, validateBudgetExists } from "../../../middlewares/budgetMiddleware"
import Budget from "../../../models/Budget"
import { budgets } from "../../mocks/budgets"

jest.mock("../../../models/Budget", () => ({
    findByPk: jest.fn()
}))

describe("budgetMiddleware - validateBudgetExists", () => {
    it("should return 404 if budget does not exist", async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(null)
        const req = createRequest({
            params: { budgetId: 5 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toEqual({ message: "Presupuesto no encontrado" })
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
    })

    it("should save the budget in the request and call next function", async () => {
        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0])
        const req = createRequest({
            params: { budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)

        expect(req.budget).toEqual(budgets[0])
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
    })

    it("should handle if there is an error", async () => {
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error)
        const req = createRequest({
            params: { budgetId: 5 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateBudgetExists(req, res, next)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ message: "Hubo un error" })
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
    })
})

describe("budgetMiddleware - hasAccess", () => {
    it("should return 401 if user does not have access to the budget", async () => {
        const req = createRequest({
            params: { budgetId: 1 },
            user: { id: 2 },
            budget: budgets[0]
        })
        const res = createResponse()
        const next = jest.fn()
    
        await hasAccess(req, res, next)
    
        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toEqual({ message: "No cuentas con los permisos para relizar esta acción" })
        expect(next).not.toHaveBeenCalled()
    })

    it("should call next function if user has access to the budget", async () => {
        const req = createRequest({
            params: { budgetId: 1 },
            user: { id: 1 },
            budget: budgets[0]
        })
        const res = createResponse()
        const next = jest.fn()
    
        hasAccess(req, res, next)
    
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
    })
})