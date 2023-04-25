import { Request, Response } from "express";
import mongoose from "mongoose";
import { apiResponse } from "../../common";
import { draftInvoiceModel, expenseModel, supplierModel, userModel } from "../../database";
import { /*invoicePDF,*/ responseMessage, invoiceByMail_PDF, sendPDF } from "../../helper";

const ObjectId = mongoose.Types.ObjectId

export const webView = async (req: Request, res: Response) => {
    let { id } = req.params,
        response: any = {}
    try {
        response = await draftInvoiceModel.aggregate([
            { $match: { _id: new ObjectId(id), isActive: true } },
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
            },
            {
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
                    ],
                    as: "Customer_Data"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "User_Data"
                }
            },
        ])
        if (response) {
            // console.log("----res", response[0].Customer_Data);
            // let pdf = await invoicePDF(response, `pdf/${response[0]?._id}`) //----invoicePDF-generate
            // console.log("------pdf", pdf);
            return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("invoice"), { response, /*pdf: response[0].pdfUrl*/ }, {}));
        } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("invoice"), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}