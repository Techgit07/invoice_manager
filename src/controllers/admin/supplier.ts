import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { draftInvoiceModel, userModel, supplierModel, expenseModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const getSupplier = async (req, res) => {
    let body: any = req.body,
        { limit, page, search } = req.body,
        match: any = { isActive: true },
        skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        if (search && search != "") {
            let supplierName: Array<any> = []
            search = search.split("")
            await search.forEach(data => {
                supplierName.push({ supplierName: { $regex: data, $options: 'si' } })
            });
            match.$or = [{ $and: supplierName }]
        }
        let response: any = await supplierModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
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
            {
                $lookup: {
                    from: "users",
                    let: { id: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: { name: 1, createdAt: 1, updatedAt: 1 }
                        }
                    ],
                    as: "User_Data"
                }
            },
        ])
        let count = await supplierModel.countDocuments(match)
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('supplier'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('supplier'), {
            response,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(count / (limit) as number),
                data_count: count
            }
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const supplierById = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        { id } = req.params
    try {
        let response: any = await supplierModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true } },
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
            {
                $lookup: {
                    from: "users",
                    let: { id: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: { name: 1, createdAt: 1, updatedAt: 1 }
                        }
                    ],
                    as: "User_Data"
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