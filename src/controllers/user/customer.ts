import { Request, response, Response } from "express";
import mongoose from "mongoose";
import { apiResponse } from "../../common";
import { customerModel, draftInvoiceModel, invoiceItemModel, userModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = mongoose.Types.ObjectId

export const addCustomer = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    let mail = await body.email.map((x => x.toLowerCase()))
    body.email = mail
    try {
        body.createdBy = new ObjectId(user?._id);
        let isExist = await customerModel.findOne({ createdBy: new ObjectId(user?._id), email: body.email, mobile: body.mobile, isActive: true });
        if (!isExist) {
            let response = await customerModel.create(body);
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('customer'), response, {}))
        } else { return res.status(409).json(new apiResponse(409, responseMessage?.dataAlreadyExist('customer'), null, {})) }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}

export const getCustomer = async (req: Request, res: Response) => {
    let body: any = req.body,
        { user }: any = req.headers
    let response: any = {}
    try {
        response = await customerModel.aggregate([
            { $match: { createdBy: new ObjectId(user?._id), isActive: true } },
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
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("customer"), response, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("customer"), null, {})) }
    } catch (error) {
        console.log('error :>> ', error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}

// export const getPostCustomerById = async (req: Request, res: Response) => {
//     let { user }: any = req.headers,
//         id = req.params.id
//     try {
//         let response = await customerModel.findOne({ _id: id, createdBy: user?._id, isActive: true })
//         if (!response) {
//             return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('customer'), null, {}))
//         } else { return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('customer'), response, {})) }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
//     }
// }

export const customerById = async (req: Request, res: Response) => {
    let { id } = req.params,
        { user }: any = req.headers
    let response: any = {}
    try {
        response = await customerModel.aggregate([
            { $match: { createdBy: new ObjectId(user?._id), _id: new ObjectId(id), isActive: true } },
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

// ----for testing, not in project APIs
export const updateCustomer = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    body.updatedBy = new ObjectId(user?._id);
    // console.log("---body.updatedBy", body.updatedBy);
    try {
        let response = await customerModel.findOneAndUpdate({ createdBy: new ObjectId(user?._id), _id: new ObjectId(body.id), isActive: true }, body, { new: true });
        // console.log(response);
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('community'), response, {}));
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.updateDataError('community'), null, {})); }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const deleteCustomer = async (req: Request, res: Response) => {
    let { id } = req.params,
        { user }: any = req.headers
    try {
        let data: any = await customerModel.findOneAndUpdate({ createdBy: new ObjectId(user?._id), _id: Object(id), isActive: true }, { isActive: false }, { new: true });
        if (data) {
            await draftInvoiceModel.updateMany({ billTo: new ObjectId(id), isActive: true }, { isActive: false }, { new: true });
            await invoiceItemModel.updateMany({ billTo: new ObjectId(id), isActive: true }, { isActive: false }, { new: true });
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('customer'), data, {}));
        } return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, null, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
}


