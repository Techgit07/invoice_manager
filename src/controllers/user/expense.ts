import { Request, Response } from "express";
import { expenseModel, supplierModel, categoryModel } from "../../database";
import { apiResponse } from "../../common";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const addExpense = async (req: Request, res: Response) => {
    let body = req.body,
        { user }: any = req.headers
    body.createdBy = ObjectId(user?._id)
    try {
        if (!(body.category.length == 0)) {
            let imgData = await categoryModel.findOne({ categoryName: body.category, isActive: true })
            body.typeImage = imgData.image
        }
        let data = await expenseModel.create(body);
        if (data) {
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("expense"), data, {}))
        } return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const getExpense = async (req: Request, res: Response) => {
//     let { user }: any = req.headers
//     try {
//         let data: any = await expenseModel.find({ createdBy: ObjectId(user?._id), isActive: true });
//         if (data) {
//             return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("expense"), data, {}))
//         } return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("expense"), null, {}))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const getExpense = async (req, res) => {
    let { user }: any = req.headers,
        body = req.body
    try {
        let response: any = await expenseModel.aggregate([
            { $match: { createdBy: ObjectId(user?._id), isActive: true } },
            {
                $lookup: {
                    from: "suppliers",
                    let: { supplierTo: '$supplierTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$supplierTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: { supplierName: 1, _id: 0 }
                        }
                    ],
                    as: "Expense_Data"
                }
            },
            {
                $addFields: {
                    supplierName: "$Expense_Data.supplierName"
                }
            },
            {
                $project: { Expense_Data: 0 }
            },
            { $addFields: { PAID: { $cond: { if: { $eq: ["$supplierName", []] }, then: true, else: false } } } },
        ])
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('expense'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('expense'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const deleteExpense = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        { id } = req.params
    try {
        let response = await expenseModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true }, { isActive: false }, { new: true })//----softDelete
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('expense'), response, {}));
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const expenseById = async (req: Request, res: Response) => {
//     let { user }: any = req.headers,
//         { id } = req.params
//     try {
//         // let hello: any = await expenseModel.findOne({ createdBy: ObjectId(user?._id), _id: id, isActive: true }).populate('supplierTo'),
//         //     name = hello.supplierTo.supplierName
//         // console.log("-----------------------hellobhai", hello.supplierTo.supplierName);

//         let response: any = await (await expenseModel.findOne({ createdBy: ObjectId(user?._id), _id: id, isActive: true }).populate('supplierTo')),
//             name = response.supplierTo.supplierName
//         if (response) {
//             return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("expense"), { response }, {}))
//         } else { return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("expense"), null, {})) }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const expenseById = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        { id } = req.params
    try {
        let response: any = await expenseModel.aggregate([
            { $match: { createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "suppliers",
                    let: { supplierTo: '$supplierTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$supplierTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: { supplierName: 1, _id: 0 }
                        }
                    ],
                    as: "Expense_Data"
                }
            },
            {
                $addFields: {
                    supplierName: "$Expense_Data.supplierName"
                }
            },
            {
                $project: { Expense_Data: 0 }
            },
            { $addFields: { PAID: { $cond: { if: { $eq: ["$supplierName", []] }, then: true, else: false } } } },
        ])
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('expense'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('expense'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const updateExpense = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    try {
        if (!(body.category.length == 0)) {
            let imgData = await categoryModel.findOne({ categoryName: body.category, isActive: true })
            body.typeImage = imgData.image
        }
        let response = await expenseModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), _id: ObjectId(body?.id) }, body, { new: true })
        // console.log("-----------", response);

        if (response) { return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('expense'), response, {})) }
        else { return res.status(403).json(new apiResponse(403, responseMessage?.updateDataError('expense'), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const getCategory = async (req: Request, res: Response) => {
    let { user }: any = req.headers
    try {
        let cate = await categoryModel.find({ isActive: true })
        if (!cate) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('category'), null, {}))
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('category'), cate, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}