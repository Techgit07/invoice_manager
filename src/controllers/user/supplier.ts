import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { draftInvoiceModel, userModel, supplierModel, expenseModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const addSupplier = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    let mail = await body.email.map((x => x.toLowerCase()))
    body.email = mail
    try {
        body.createdBy = new ObjectId(user?._id)
        let isExist = await supplierModel.findOne({ createdBy: ObjectId(user?._id), email: body.email, mobile: body.mobile, isActive: true })
        if (!isExist) {
            let response: any = await new supplierModel(body).save();
            if (response) {
                return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("supplier"), response, {}))
            } else { return res.status(403).json(new apiResponse(403, responseMessage.addDataError, null, {})) }
        } else { return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("supplier"), null, {})) }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}

// export const addSupplier = async (req: Request, res: Response) => {
//     let { user }: any = req.headers,
//         body = req.body
//     try {
//         body.createdBy = new ObjectId(user?._id);
//         let isExist = await supplierModel.findOne({ createdBy: new ObjectId(user?._id), email: body.email, mobile: body.mobile, isActive: true });
//         if (!isExist) {
//             let response = await supplierModel.create(body);
//             return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('customer'), response, {}))
//         } else { return res.status(409).json(new apiResponse(409, responseMessage?.dataAlreadyExist('customer'), null, {})) }
//     } catch (error) {
//         console.log("error", error);
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
//     }

// export const getSupplier = async (req: Request, res: Response) => {
//     let body: any = req.body,
//         { user }: any = req.headers
//     let response: any = {}
//     try {
//         response = await userModel.aggregate([
//             { $match: { _id: new ObjectId(user?._id), isActive: true } },
//             { $project: { email: 1, businessName: 1, createdAt: 1, updatedAt: 1 } },
//             {
//                 $lookup: {
//                     from: "suppliers",
//                     let: { userId: new ObjectId(user?._id) },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$createdBy", "$$userId"] },
//                                         { $eq: ["$isActive", true] },
//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: "invoices",
//                                 let: { supplierId: '$_id' },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$supplierTo", "$$supplierId"] },
//                                                     { $eq: ["$isActive", true] },
//                                                 ]
//                                             }
//                                         },
//                                     },
//                                     {
//                                         $project: {
//                                             invoiceNo: 1, Total: 1, createdAt: 1, updatedAt: 1
//                                         },
//                                     }
//                                 ],
//                                 as: "Invoice_Data",
//                             },
//                         },
//                     ],
//                     as: "Suppier_Data"
//                 },
//             },
//         ])
//         // for (let k = 0; k < response[0].Supplier_Data.length; k++) {
//         //     const element = response[0].Supplier_Data[k];
//         //     element.invoiceTotal = 0
//         //     for (let j = 0; j < element.Invoice_Data.length; j++) {
//         //         const element1 = element.Invoice_Data[j];
//         //         element.invoiceTotal += element1.Total
//         //     }
//         // }
//         if (response) {
//             return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("supplier"), response, {}))
//         } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("supplier"), null, {})) }
//     } catch (error) {
//         console.log('error :>> ', error)
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
//     }
// }

// export const getSupplier = async (req: Request, res: Response) => {
//     let { user }: any = req.headers
//     try {
//         let response: any = await supplierModel.findOne({ createdBy: ObjectId(user?._id), isActive: true })
//         if (response) {
//             return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('supplier'), response, {}))
//         } return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('supplier'), null, {}))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
//     }
// }

export const getSupplier = async (req, res) => {
    let { user }: any = req.headers,
        body = req.body
    try {
        let response: any = await supplierModel.aggregate([
            { $match: { createdBy: ObjectId(user?._id), isActive: true } },
            {
                $lookup: {
                    from: "expenses",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$supplierTo", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "Expense_Data"
                }
            },
        ])
        // console.log(response[0].Expense_Data[])
        // for (let i = 0; i < response[0].Expense_Data.length; i++) {
        //     const element = response[0].Expense_Data[i];
        //     let expense = await expenseModel.find({ _id: element._id, paid: true, isActive: true })
        //     console.log("Hello World >>", expense);
        //     if (Object.keys(expense)?.length == 0) {
        //         supplierModel.updateMany({ _id: response[0]._id, isActive: true }, { paid: false }, { new: true })
        //     } else {
        //         let hello = supplierModel.updateMany({ _id: response[0]._id, isActive: true }, { paid: true }, { new: true });
        //         console.log(hello);
        //     }
        // }
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('supplier'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('supplier'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const supplierById = async (req, res) => {
    let { user }: any = req.headers,
        { id } = req.params
    try {
        let response: any = await supplierModel.aggregate([
            { $match: { createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "expenses",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$supplierTo", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "Expense_Data"
                }
            },
        ])
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('supplier'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('supplier'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const deleteSupplier = async (req: Request, res: Response) => {
    let { id } = req.params,
        { user }: any = req.headers
    try {
        let data = await supplierModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true }, { isActive: false }, { new: true });
        if (data) {
            await expenseModel.updateMany({ supplierTo: ObjectId(id), isActive: true }, { isActive: false }, { new: true });
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('supplier'), data, {}));
        } return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, data, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}));
    }
}   