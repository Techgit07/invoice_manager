import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { responseMessage } from "../../helper";
import { payRecordModel, draftInvoiceModel, expenseModel, invoiceItemModel } from "../../database";

const ObjectId = require('mongoose').Types.ObjectId;

export const addPayRecordExpense = async (req: Request, res: Response) => {
    let body = req.body,
        { user }: any = req.headers
    body.createdBy = ObjectId(user?._id)
    try {
        let paid = await expenseModel.findOne({ _id: ObjectId(body.expenseId), price: body.amount, isActive: true });
        // console.log("---Exp", paid)
        if (paid) {
            await expenseModel.findOneAndUpdate({ _id: ObjectId(body.expenseId), isActive: true }, { paid: true }, { new: true });
            let data = await payRecordModel.create(body);
            if (data) {
                return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("payrecord"), data, {}))
            } return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {}))
        } else { return res.status(402).json(new apiResponse(402, "Please Paid Your Valid Amount", null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const addPayRecordInvoice = async (req: Request, res: Response) => {
    let body = req.body,
        id = req.body,
        { user }: any = req.headers
    body.createdBy = ObjectId(user?._id);
    try {
        let paid: any = await invoiceItemModel.findOne({ id: ObjectId(body.invoiceId), Total: body.amount, isActive: true });
        // let paid: any = await draftInvoiceModel.findOne({ _id: ObjectId(id), Total: body.amount, isActive: true });
        // console.log("---Inv", paid);
        if (paid) {
            await draftInvoiceModel.findOneAndUpdate({ _id: ObjectId(body.invoiceId), isActive: true }, { paid: true }, { new: true });
            let data = await payRecordModel.create(body);
            if (data) {
                return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("payrecord"), data, {}))
            } return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {}))
        } else { return res.status(402).json(new apiResponse(402, "Please Paid Your Valid Amount", null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const getPayRecord = async (req: Request, res: Response) => {
//     let { user }: any = req.headers,
//         id = req.body
//     try {
//         let response: any = await payRecordModel.aggregate([
//             { $match: { createdBy: ObjectId(user?._id), isActive: true } },
//             {
//                 $lookup: {
//                     from: "expenses",
//                     let: { id: '$expenseId' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$_id", "$$id"] },
//                                         { $eq: ["$isActive", true] },
//                                     ]
//                                 }
//                             }
//                         },
//                     ],
//                     as: "Expense_Data"
//                 }
//             },
//         ])
//         let count = response.price - response.amount
//         if (!response) {
//             return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('payRecord'), null, {}));
//         } else {
//             return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('payRecord'), { response, count }, {}));
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }