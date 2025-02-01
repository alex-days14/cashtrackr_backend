import { createRequest, createResponse } from "node-mocks-http"
import { validateExpenseExists } from "../../../middlewares/expenseMiddleware"
import Expense from "../../../models/Expense"
import { expenses } from "../../mocks/expenses"
import { budgets } from "../../mocks/budgets"
import { hasAccess } from "../../../middlewares/budgetMiddleware"

jest.mock("../../../models/Expense", () => ({
    findByPk: jest.fn()
}))

describe("expenseMiddleware - validateExpenseExists", () => {
    beforeEach(() => {
        (Expense.findByPk as jest.Mock).mockImplementation((id) => {
            const expense = expenses.find(e => e.id == id)
            return Promise.resolve(expense)
        })
    })

    it("should return 404 if expense is not found or is not owned by the user", async () => {
        const req = createRequest({
            params: { expenseId: 5, budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toEqual({ message: "Gasto no encontrado" })
        expect(req.expense).toBeUndefined()
        expect(next).not.toHaveBeenCalled()
    })

    it("should call next function if expense exists", async () => {
        const req = createRequest({
            params: { expenseId: 1, budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        expect(req.expense).toEqual(expenses[0])
        expect(Expense.findByPk).toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
    })

    it("should handle any error in server", async () => {
        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)
        const req = createRequest({
            params: { expenseId: 1, budgetId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateExpenseExists(req, res, next)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ message: "Hubo un error" })
        expect(req.expense).toBeUndefined()
        expect(next).not.toHaveBeenCalled()
    })

    it("should prevent unauthorized users from adding expenses", () => {
        const req = createRequest({
            method: "POST",
            url: "/api/budgets/:budgetId/expenses",
            budget: budgets[0],
            user: { id: 23 },
            body: {
                name: "Fotos",
                amount: 400
            }
        })
        const res = createResponse()
        const next = jest.fn()

        hasAccess(req, res, next)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toEqual({ message: "No cuentas con los permisos para relizar esta acción" })
        expect(next).not.toHaveBeenCalled
    })
})