import { Request, response, Response } from "express";
import { draftInvoiceModel, customerModel, userModel, payRecordModel, invoiceItemModel } from "../../database";
import { apiResponse } from "../../common";
import QRcode from 'qrcode'
import { responseMessage, /*invoicePDF,*/ invoiceByMail_PDF } from "../../helper";
import { number } from "joi";

const ObjectId = require('mongoose').Types.ObjectId;

export const addDraftInvoice = async (req: Request, res: Response) => {
    let body: any = req.body,
        { user }: any = req.headers
    body.createdBy = ObjectId(user?._id);
    try {
        //-----invoiceCount
        let inc = await draftInvoiceModel.find({ createdBy: body.createdBy, isActive: true }).count() + 1
        body.invoiceNo = inc.toString().length == 1 ? `0${inc}` : inc

        //-----qrlinkGenerate
        let name: any = await userModel.findOne({ _id: ObjectId(body.createdBy), isActive: true });
        let userName = name.userName

        if (body.qrCode == true) {
            let url = `https://www.paypal.com/paypalme/${userName}`
            body.qrLink = url
        }

        const frequency: any = new Date(body.dueDate)
        console.log(" date", frequency);
        let threeDaysBefore = frequency.setDate(frequency.getDate() - 3);
        // let sevenDaysBefore = frequency.setDate(frequency.getDate() - 7 + 3);
        let threeDaysAfter = frequency.setDate(frequency.getDate() + 6);
        let sevenDaysAfter = frequency.setDate(frequency.getDate() + 4);
        body.threeDaysBefore = threeDaysBefore
        // body.sevenDaysBefore = sevenDaysBefore             
        body.threeDaysAfter = threeDaysAfter
        body.sevenDaysAfter = sevenDaysAfter
        let response: any = await new draftInvoiceModel(body).save();

        console.log("respones----------- ", response);
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('draftinvoice'), response, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage.addDataError, null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const getDraftInvoice = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body: any = req.body
    try {
        let response: any = await draftInvoiceModel.aggregate([
            { $match: { createdBy: ObjectId(user?._id), isActive: true } },
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
                            }
                        },
                    ],
                    as: "Item_Data"
                }
            }, {
                $lookup: {
                    from: "customers",
                    let: { billTo: '$billTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$billTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        }, {
                            $project: { billingName: 1, _id: 0 }
                        }
                    ],
                    as: "customer"
                }
            },
            // {
            //     $set: { "customer.billingName": "12345" }
            // },
            {
                $unwind: {
                    path: "$customer",
                }
            }, {
                $addFields: {
                    billingName: "$customer.billingName"
                }
            }, {
                $project: { customer: 0 }
            }
        ])
        // let AllTotal = 0
        // for (let i = 0; i < response.length; i++) {
        //     // console.log("check element ", response[i].Item_Data.length);
        //     let itemTotal = 0
        //     for (let j = 0; j < response[i].Item_Data.length; j++) {
        //         const element1 = response[i].Item_Data[j].Total;
        //         // console.log("Item Data Count", element1);
        //         itemTotal += element1
        //     } AllTotal += itemTotal
        //     console.log(AllTotal);
        // }
        // console.log("hello--->>", response[0].dueDate.toLocaleDateString());
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('invoice'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('invoice'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const invoiceById = async (req: Request, res: Response) => {
//     let { user }: any = req.headers,
//         { id } = req.params
//     try {
//         let response = await draftInvoiceModel.findOne({ createdBy: ObjectId(user?._id), _id: id, isActive: true });
//         if (response) { return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("invoice"), response, {})) }
//         else { return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("invoice"), null, {})) }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const invoiceById = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        { id } = req.params,
        body: any = req.body
    try {
        let response: any = await draftInvoiceModel.aggregate([
            { $match: { createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true } },
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
                            }
                        },
                    ],
                    as: "Item_Data"
                }
            }, {
                $lookup: {
                    from: "customers",
                    let: { billTo: '$billTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$billTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: { billingName: 1, _id: 0 }
                        }
                    ],
                    as: "Customer_Data"
                }
            },
            {
                $unwind: {
                    path: "$Customer_Data"
                }
            },
            {
                $addFields: {
                    billingName: "$Customer_Data.billingName"
                }
            },
            {
                $project: { Customer_Data: 0 }
            }
        ])
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('invoice'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('invoice'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, { error }))
    }
}

export const updateInvoice = async (req: Request, res: Response) => {
    let body: any = req.body,
        { user }: any = req.headers
    body.updatedBy = ObjectId(user?._id);
    try {

        //-----qrlinkUpdate
        let name: any = await userModel.findOne({ _id: ObjectId(body.updatedBy), isActive: true });
        let userName = name.userName

        if (body.qrCode == true) {
            let url = `https://www.paypal.com/paypalme/${userName}`
            body.qrLink = url
        } if (body.qrCode == false) { body.qrLink = null }

        if (!(body.dueDate == "")) {
            const frequency: any = new Date(body.dueDate)
            console.log(" date", frequency);
            let threeDaysBefore = frequency.setDate(frequency.getDate() - 3);
            // let sevenDaysBefore = frequency.setDate(frequency.getDate() - 7 + 3);
            let threeDaysAfter = frequency.setDate(frequency.getDate() + 6);
            let sevenDaysAfter = frequency.setDate(frequency.getDate() + 4);
            body.threeDaysBefore = threeDaysBefore
            // body.sevenDaysBefore = sevenDaysBefore             
            body.threeDaysAfter = threeDaysAfter
            body.sevenDaysAfter = sevenDaysAfter
        }

        let response: any = await draftInvoiceModel.findOneAndUpdate({ _id: ObjectId(body?.id) }, body, { new: true })

        // console.log("response-->>", response);
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('invoice'), response, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.updateDataError('invoice'), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const invoicesendBy_Mail = async (req: Request, res: Response) => {
//     let body = req.body
//     try {
//         let existMail: any = await customerModel.findOne({ email: body.email, isActive: true })
//         console.log(existMail);
//         if (!existMail) {
//             return res.status(403).json(new apiResponse(403, responseMessage?.invalidEmail, null, {}))
//         }
//         // let location: any = await invoicePDF(existMail, `${existMail[0]?._id}/pdf`);
//         let response = await invoiceByMail_PDF(existMail);
//         return res.status(200).json(new apiResponse(200, responseMessage?.PDFEmailSend, response, {}))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const deleteInvoice = async (req: Request, res: Response) => {
    let { id } = req.params,
        { user }: any = req.headers
    try {
        let response: any = await draftInvoiceModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true }, { isActive: false }, { new: true }); //----softDelete
        if (response) {
            await invoiceItemModel.updateMany({ invoiceId: ObjectId(id), isActive: true }, { isActive: false }, { new: true });
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('invoice'), response, {}));
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, null, {})); }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
}