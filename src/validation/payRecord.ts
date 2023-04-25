// import { Request, Response } from "express";
// import Joi from "joi";
// import { apiResponse } from "../common";

// export const payRecord = async (req: Request, res: Response, next: Function) => {
//     const schema = Joi.object({
//         // invoiceId: Joi.string().allow(null, "").error(new Error("Enter InvoiceId")),
//         expenseId: Joi.string().required().error(new Error("Enter ExpenseId")),
//         amount: Joi.number().required().error(new Error("amount is Required Field")),
//         date: Joi.date().required().error(new Error("date is Required Field")),
//         paymentMethod: Joi.number().required().error(new Error("paymentMethod is Required Field")),
//         sendReciept: Joi.boolean().default(false)
//     })
//     schema.validateAsync(req.body).then(() => {
//         return next()
//     }).catch(err => {
//         return res.status(400).json(new apiResponse(400, err.message, null, err))
//     })
// }