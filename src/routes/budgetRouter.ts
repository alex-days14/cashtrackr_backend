import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { hasAccess, validateBudgetBody, validateBudgetExists, validateBudgetId } from "../middlewares/budgetMiddleware";
import { ExpenseController } from "../controllers/ExpenseController";
import { /* belongToBudget,  */validateExpenseBody, validateExpenseExists, validateExpenseId } from "../middlewares/expenseMiddleware";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate)

// Budget Routes
router.get("/",
    BudgetController.getAllByUser
) // ? Get all budgets

router.post("/",
    validateBudgetBody, 
    BudgetController.create
) // ? Create a new budget

// -------------------------------------------------------------
// ? BUDGET ID MIDDLEWARES
router.param("budgetId", validateBudgetId)
router.param("budgetId", validateBudgetExists)
router.param("budgetId", hasAccess)

router.get("/:budgetId",
    BudgetController.getById
) // ? Get a budget by id

router.put("/:budgetId", 
    validateBudgetBody,
    BudgetController.editById
) // ? Edit an existing budget

router.delete("/:budgetId",
    BudgetController.deleteById
) // ? Delete a budget


/* Routes For Expenses */
router.post("/:budgetId/expenses",
    validateExpenseBody,
    ExpenseController.create
) // ? Create a new expense for a budget

// -------------------------------------------------------------
// ? EXPENSE ID MIDDLEWARES
router.param("expenseId", validateExpenseId)
router.param("expenseId", validateExpenseExists)
/* router.param("expenseId", belongToBudget) */

router.get("/:budgetId/expenses/:expenseId",
    ExpenseController.getById
) // ? Get an expense by id

router.put("/:budgetId/expenses/:expenseId",
    validateExpenseBody,
    ExpenseController.editById
) // ? Edit an expense by id

router.delete("/:budgetId/expenses/:expenseId",
    ExpenseController.deleteById
) // ? Delete an expense by id

export default router