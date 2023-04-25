import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { customerModel, draftInvoiceModel, invoiceItemModel, userModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const getCustomer = async (req: Request, res: Response) => {
    let { limit, page, search } = req.body,
        match: any = { isActive: true },
        skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        if (search && search != "") {
            let billingName: Array<any> = []
            search = search.split("")
            await search.forEach(data => {
                billingName.push({ billingName: { $regex: data, $options: 'si' } })
            });
            match.$or = [{ $and: billingName }]
        }
        let response: any = await customerModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "draftinvoices",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$billTo", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        // {
                        //     $project: { invoiceNo: 1, createdAt: 1, updatedAt: 1 }
                        // },
                        {
                            $lookup: {
                                from: "invoiceitems",
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$invoiceId", "$$id"] },
                                                    { $eq: ["$isActive", true] },
                                                ]
                                            }
                                        },
                                    },
                                    // {
                                    //     $project: { Total: 1, createdAt: 1, updatedAt: 1 }
                                    // },
                                ],
                                as: "Item_Data",
                            },
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
                    ],
                    as: "Invoice_Data"
                },
            },
        ])
        // for (let k = 0; k < response[0].Customer_Data.length; k++) {
        //     const element = response[0].Customer_Data[k];
        //     element.invoiceTotal = 0
        //     for (let j = 0; j < element.Invoice_Data.length; j++) {
        //         const element1 = element.Invoice_Data[j];
        //         element.invoiceTotal += element1.Total
        //     }
        // }
        let count = await customerModel.countDocuments(match)
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("customer"), {
                response,
                state: {
                    page,
                    limit,
                    page_limit: Math.ceil(count / (limit) as number),
                    data_count: count
                }
            }, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("customer"), null, {})) }
    } catch (error) {
        console.log('error :>> ', error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}

export const customerById = async (req: Request, res: Response) => {
    let { id } = req.params,
        { user }: any = req.headers
    let response: any = {}
    try {
        response = await customerModel.aggregate([
            { $match: { _id: ObjectId(id), isActive: true } },
            {
                $lookup: {
                    from: "draftinvoices",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$billTo", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        // {
                        //     $project: { invoiceNo: 1, createdAt: 1, updatedAt: 1 }
                        // },
                        {
                            $lookup: {
                                from: "invoiceitems",
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$invoiceId", "$$id"] },
                                                    { $eq: ["$isActive", true] },
                                                ]
                                            }
                                        },
                                    },
                                    // {
                                    //     $project: { Total: 1, createdAt: 1, updatedAt: 1 }
                                    // },
                                ],
                                as: "Item_Data",
                            },
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
                    ],
                    as: "Invoice_Data"
                },
            },
        ])
        // for (let i = 0; i < response.length; i++) {
        //     response[i].Total = 0
        //     const element = response[i];
        //     for (let j = 0; j < element.Invoice_Data.length; j++) {
        //         const element1 = element.Invoice_Data[j];
        //         response[i].Total += element1.Total
        //     }
        // }
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("customer"), response, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("customer"), null, {})) }
    } catch (error) {
        console.log('error :>> ', error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}