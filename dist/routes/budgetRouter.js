"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BudgetController_1 = require("../controllers/BudgetController");
const budgetMiddleware_1 = require("../middlewares/budgetMiddleware");
const ExpenseController_1 = require("../controllers/ExpenseController");
const expenseMiddleware_1 = require("../middlewares/expenseMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
// Budget Routes
router.get("/", BudgetController_1.BudgetController.getAllByUser); // ? Get all budgets
router.post("/", budgetMiddleware_1.validateBudgetBody, BudgetController_1.BudgetController.create); // ? Create a new budget
// -------------------------------------------------------------
// ? BUDGET ID MIDDLEWARES
router.param("budgetId", budgetMiddleware_1.validateBudgetId);
router.param("budgetId", budgetMiddleware_1.validateBudgetExists);
router.param("budgetId", budgetMiddleware_1.hasAccess);
router.get("/:budgetId", BudgetController_1.BudgetController.getById); // ? Get a budget by id
router.put("/:budgetId", budgetMiddleware_1.validateBudgetBody, BudgetController_1.BudgetController.editById); // ? Edit an existing budget
router.delete("/:budgetId", BudgetController_1.BudgetController.deleteById); // ? Delete a budget
/* Routes For Expenses */
router.post("/:budgetId/expenses", expenseMiddleware_1.validateExpenseBody, ExpenseController_1.ExpenseController.create); // ? Create a new expense for a budget
// -------------------------------------------------------------
// ? EXPENSE ID MIDDLEWARES
router.param("expenseId", expenseMiddleware_1.validateExpenseId);
router.param("expenseId", expenseMiddleware_1.validateExpenseExists);
/* router.param("expenseId", belongToBudget) */
router.get("/:budgetId/expenses/:expenseId", ExpenseController_1.ExpenseController.getById); // ? Get an expense by id
router.put("/:budgetId/expenses/:expenseId", expenseMiddleware_1.validateExpenseBody, ExpenseController_1.ExpenseController.editById); // ? Edit an expense by id
router.delete("/:budgetId/expenses/:expenseId", ExpenseController_1.ExpenseController.deleteById); // ? Delete an expense by id
exports.default = router;
//# sourceMappingURL=budgetRouter.js.map