import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { budgets } from "../../mocks/budgets";
import { ExpenseController } from "../../../controllers/ExpenseController";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/Expense", () => ({
    create: jest.fn()
}))

describe('ExpenseController.create', () => {
    it("should create a new expense", async () => {
        const expenseMock = {
            save: jest.fn().mockResolvedValue(true),
            budgetId: null
        };
        (Expense.create as jest.Mock).mockResolvedValue(expenseMock);
        const req = createRequest({
            method: "POST",
            url: "/api/budgets/:budgetId/expenses",
            body: {
                name: "Limosina",
                amount: 300
            },
            budget: budgets[0]
        })
        const res = createResponse()

        await ExpenseController.create(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(201)
        expect(data).toEqual({ message: "Gasto creado exitosamente" })
        expect(expenseMock.save).toHaveBeenCalled()
        expect(expenseMock.save).toHaveBeenCalledTimes(1)
        expect(Expense.create).toHaveBeenCalledWith(req.body)
        expect(expenseMock.budgetId).toBe(budgets[0].id)
    })

    it("should handle an error in expense creation", async () => {
        const expenseMock = {
            save: jest.fn(),
        };
        (Expense.create as jest.Mock).mockRejectedValue(new Error);
        const req = createRequest({
            method: "POST",
            url: "/api/budgets/:budgetId/expenses",
            body: {
                name: "Limosina",
                amount: 300
            },
            budget: budgets[0]
        })
        const res = createResponse()

        await ExpenseController.create(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ message: "Hubo un error" })
        expect(expenseMock.save).not.toHaveBeenCalled()
        expect(Expense.create).toHaveBeenCalledWith(req.body)
    })
})

describe("ExpenseController.getById", () => {  
    it("should return an expense by id", async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets/:budgetId/expenses/:expenseId",
            expense: expenses[0]
        })
        const res = createResponse()

        await ExpenseController.getById(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(expenses[0])
    })
})

describe("ExpenseController.editById", () => {  
    it("should edit an expense by id", async () => {
        const expenseMock = {
            ...expenses[0],
            update: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: "PUT",
            url: "/api/budgets/:budgetId/expenses/:expenseId",
            expense: expenseMock,
            body: {
                name: "Limosina ACTUALIZADA",
                amount: 345
            },
        })
        const res = createResponse()

        await ExpenseController.editById(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200)
        expect(data).toEqual({ message: "Gasto actualizado exitosamente" })
        expect(expenseMock.update).toHaveBeenCalled()
        expect(expenseMock.update).toHaveBeenCalledTimes(1)
        expect(expenseMock.update).toHaveBeenCalledWith(req.body)
    })
})

describe("ExpenseController.deleteById", () => {  
    it("should delete an expense by id", async () => {
        const expenseMock = {
            ...expenses[0],
            destroy: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: "DELETE",
            url: "/api/budgets/:budgetId/expenses/:expenseId",
            expense: expenseMock
        })
        const res = createResponse()

        await ExpenseController.deleteById(req, res);

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200)
        expect(data).toEqual({ message: "Gasto eliminado exitosamente" })
        expect(expenseMock.destroy).toHaveBeenCalled()
        expect(expenseMock.destroy).toHaveBeenCalledTimes(1)
    })
})