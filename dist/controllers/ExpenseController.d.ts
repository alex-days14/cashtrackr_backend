import { Request, Response } from "express";
export declare class ExpenseController {
    static create: (req: Request, res: Response) => Promise<void>;
    static getById: (req: Request, res: Response) => Promise<void>;
    static editById: (req: Request, res: Response) => Promise<void>;
    static deleteById: (req: Request, res: Response) => Promise<void>;
}
