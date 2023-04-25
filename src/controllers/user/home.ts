import { Request, Response } from "express";
import mongoose from "mongoose";
import { apiResponse } from "../../common";
import { customerModel, draftInvoiceModel, expenseModel, supplierModel, userModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = mongoose.Types.ObjectId

// export const invoice = async (req: Request, res: Response) => {
//     let body = req.body,
//         user: any = req.headers.user
//     let response: any = {}
//     let sorting = []
//     try {
//         let sort = await customerModel.find({ createdBy: new ObjectId(user?._id), isActive: true });
//         for (const iterator of sort) {
//             let data = iterator.billingName;
//             // console.log("----data", data)
//             sorting.push(data);
//         }
//         console.log("----sorting", sorting);

//         response = await userModel.aggregate([
//             { $match: { _id: new ObjectId(user?._id), isActive: true } },
//             { $project: { createdAt: 1, updatedAt: 1, name: 1 } },
//             {
//                 $lookup: {
//                     from: "customers",
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
//                                 from: "draftinvoices",
//                                 let: { customerId: '$_id' },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$billTo", "$$customerId"] },
//                                                     { $eq: ["$isActive", true] },
//                                                 ]
//                                             }
//                                         },
//                                     },
//                                     {
//                                         $lookup: {
//                                             from: "invoiceitems",
//                                             let: { id: '$_id' },
//                                             pipeline: [
//                                                 {
//                                                     $match: {
//                                                         $expr: {
//                                                             $and: [
//                                                                 { $eq: ["$invoiceId", "$$id"] },
//                                                                 { $eq: ["$isActive", true] },
//                                                             ]
//                                                         }
//                                                     },
//                                                 },

//                                             ],
//                                             as: "Item_Data",
//                                         },
//                                     }
//                                 ],
//                                 as: "Invoice_Data",
//                             },
//                         },
//                     ],
//                     as: "Customer_Data"
//                 },
//             },
//         ])
//         // for (let i = 0; i < response[0].Customer_Data.length; i++) {
//         //     const element = response[0].Customer_Data[i];
//         //     element.invoiceTotal = 0

//         //     for (let j = 0; j < element.Invoice_Data.length; j++) {
//         //         const element1 = element.Invoice_Data[j];
//         //         element.invoiceTotal += element1.Total
//         //     }
//         // }
//         if (response) {
//             return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("invoice"), { response, sorting }, {}))
//         } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("invoice"), null, {})) }
//     } catch (error) {
//         console.log('error :>>', error)
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const invoice = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        { search } = req.body,
        body = req.body,
        match: any = { isActive: true }
    let response: any = {}
    try {
        if (search && search != "") {
            let billingName: Array<any> = []
            search = search.split("")
            await search.forEach(data => {
                billingName.push({ billingName: { $regex: data, $options: 'si' } })
            });
            match.$or = [{ $and: billingName }]
        }
        response = await userModel.aggregate([
            { $match: { _id: new ObjectId(user?._id), isActive: true, ...match } },
            { $project: { createdAt: 1, updatedAt: 1, name: 1 } },
            {
                $lookup: {
                    from: "customers",
                    let: { userId: new ObjectId(user?._id) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$createdBy", "$$userId"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "draftinvoices",
                                let: { customerId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$billTo", "$$customerId"] },
                                                    { $eq: ["$isActive", true] },
                                                ]
                                            }
                                        },
                                    },
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

                                            ],
                                            as: "Item_Data",
                                        },
                                    },
                                    {
                                        $addFields: { subtotal: { $sum: "$Item_Data.total" } }
                                    }
                                ],
                                as: "Invoice_Data",
                            },
                        },
                    ],
                    as: "Customer_Data"
                },
            },
        ])
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("invoice"), response, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("invoice"), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// for (let i = 0; i < response[0].Customer_Data.length; i++) {
//         //     const element = response[0].Customer_Data[i];
//         //     element.invoiceTotal = 0

//         //     for (let j = 0; j < element.Invoice_Data.length; j++) {
//         //         const element1 = element.Invoice_Data[j];
//         //         element.invoiceTotal += element1.Total
//         //     }
//         // }

export const expense = async (req, res) => {
    let { user } = req.headers
    try {
        let response: any = await supplierModel.aggregate([
            { $match: { createdBy: new ObjectId(user?._id), isActive: true } },
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
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('expense'), null, {}));
        } return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('expense'), response, {}));
    } catch (error) {
        console.log('error :>> ', error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}   