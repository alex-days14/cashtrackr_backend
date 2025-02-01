import { createRequest, createResponse } from "node-mocks-http"
import { budgets } from "../../mocks/budgets"
import { BudgetController } from "../../../controllers/BudgetController"
import Budget from "../../../models/Budget"
import Expense from "../../../models/Expense"

jest.mock("../../../models/Budget", () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
}))

describe("BudgetController.getAllByUser", () => {
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updatedBudgets = budgets.filter(budget => budget.userId === options.where.userId);
            return Promise.resolve(updatedBudgets)
        })
    });

    it("should return all budgets by user", async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: { id: 2 }
        })
        const res = createResponse();
        await BudgetController.getAllByUser(req, res)

        const data: Budget[] = res._getJSONData()
        const isWorking = data.every(budget => budget.userId == req.user.id)

        expect(isWorking).toBeTruthy()
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
    });

    it("should return no budgets for ID 5", async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: { id: 5 }
        })
        const res = createResponse();
        await BudgetController.getAllByUser(req, res)

        const data: Budget[] = res._getJSONData()
        const isWorking = data.every(budget => budget.userId !== req.user.id)

        expect(isWorking).toBeTruthy()
        expect(res.statusCode).toBe(200)
        expect(res.statusCode).not.toBe(404)
    });

    it("should return 500 if there is an error", async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets",
            user: { id: 2 }
        })
        const res = createResponse();
        (Budget.findAll as jest.Mock).mockRejectedValue(new Error);
        await BudgetController.getAllByUser(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ message: "Error al obtener presupuestos" })
    });
})

describe("BudgetController.create", () => {
    it("should create a budget", async () => {
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget);
        const req = createRequest({
            method: "POST",
            url: "/api/budgets",
            user: { id: 2 },
            body: {
                name: "Graduación",
                amount: 1000
            }
        })
        const res = createResponse();
        await BudgetController.create(req, res)

        const data = res._getJSONData()
        
        expect(res.statusCode).toBe(201)
        expect(data).toEqual({ message: "Presupuesto creado exitosamente" })
        expect(mockBudget.save).toHaveBeenCalled()
        expect(mockBudget.save).toHaveBeenCalledTimes(1)
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })

    it("should return statuscode 500 if there is an error", async () => {
        const mockBudget = {
            save: jest.fn()
        };
        (Budget.create as jest.Mock).mockRejectedValue(new Error);
        const req = createRequest({
            method: "POST",
            url: "/api/budgets",
            user: { id: 2 },
            body: {
                name: "Graduación",
                amount: 1000
            }
        })
        const res = createResponse();
        await BudgetController.create(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ message: "Error al crear presupuesto" })
        expect(mockBudget.save).not.toHaveBeenCalled()
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.getById', () => {
    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockReset();
        (Budget.findByPk as jest.Mock).mockImplementation((id) => {
            const budget = budgets.find(budget => budget.id === id);
            return Promise.resolve(budget)
        });
    });
    it("should return a budget (with expenses) by id", async () => {
        const req = createRequest({
            method: "GET",
            url: "/api/budgets/:budgetId",
            budget: { id: 1 }
        })
        const res = createResponse();
        await BudgetController.getById(req, res)

        const data: Budget = res._getJSONData()

        const allExpensesBelongsToBudget = data.expenses.length > 0 ? data.expenses.every(expense => expense.budgetId === req.budget.id) : true

        expect(res.statusCode).toBe(200)
        expect(allExpensesBelongsToBudget).toBeTruthy()
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, { include: [Expense] })
    })
})

describe('BudgetController.editById', () => {
    it("should edit a budget by id", async () => {
        const mockBudget = {
            update: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: "PUT",
            url: "/api/budgets/:budgetId",
            budget: mockBudget,
            body: {
                name: "Graduación ACTUALIZADO",
                amount: 12345
            }
        })
        const res = createResponse();
        await BudgetController.editById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual({ message: "Presupuesto editado exitosamente" })
        expect(mockBudget.update).toHaveBeenCalled()
        expect(mockBudget.update).toHaveBeenCalledTimes(1)
        expect(mockBudget.update).toHaveBeenCalledWith(req.body)
    })
})

describe("BudgetController.deleteById", () => {
    it("should delete a budget by id", async () => {
        const mockBudget = {
            destroy: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: "DELETE",
            url: "/api/budgets/:budgetId",
            budget: mockBudget
        })
        const res = createResponse();
        await BudgetController.deleteById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual({ message: "Presupuesto eliminado exitosamente" })
        expect(mockBudget.destroy).toHaveBeenCalled()
        expect(mockBudget.destroy).toHaveBeenCalledTimes(1)
    })
})

