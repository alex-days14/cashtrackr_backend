import { Model } from "sequelize-typescript";
import Expense from "./Expense";
import User from "./User";
declare class Budget extends Model {
    name: string;
    amount: number;
    userId: number;
    user: User;
    expenses: Expense[];
}
export default Budget;
