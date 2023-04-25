// "use strict"
// import * as joi from 'joi'
// import { apiResponse } from '../common';
// import { Request, Response } from 'express';

// export const addDraftInvoice = async (req: Request, res: Response, next: any) => {
//     const Schema = joi.object({
//         billTo: joi.string().required().error(new Error('billTo is required!')),
//         // item: joi.array().items(
//         //     joi.object().keys({
//         //         itemName: joi.string().required().error(new Error('ItemName is required!')),
//         //         itemDescription: joi.string().required().error(new Error('ItemDescription is required!')),
//         //         quantity: joi.string().required().error(new Error('Quantity is required!')),
//         //         price: joi.string().required().error(new Error('Price is required!')),
//         //         workType: joi.string().required().error(new Error('WorkType is required!')),
//         //         discount: joi.string().required().error(new Error('Discount is required!')),
//         //         mswt: joi.string().required().error(new Error('MSWT is required!'))
//         //     }),
//         // ),
//         // Discount: joi.string().required().error(new Error('Discount is required!')),
//         // Mswt: joi.string().required().error(new Error('Mswt is required!')),
//         dueDate: joi.date().allow(null, "").error(new Error('dueDate is required!')),
//         paymentMethod: joi.string().allow(null, "").error(new Error('PaymentMethod is required!')),
//         notes: joi.string().allow(null, "").error(new Error('Enter Your Notes!')),
//         paid: joi.boolean().default(false),
//         qrCode: joi.boolean().default(false),
//         payPal: joi.boolean().default(false),
//         depositeRequest: joi.boolean().default(false)
//     })
//     Schema.validateAsync(req.body).then(result => {
//         return next()
//     }).catch(error => {
//         res.status(400).json(new apiResponse(400, error.message, {}, {}))
//     })
// }

// export const updateDraftInvoice = async (req: Request, res: Response, next: any) => {
//     const Schema = joi.object({
//         id: joi.string().required().error(new Error('invoiceId is required!')),
//         // item: joi.array().items(
//         //     joi.object().keys({
//         //         itemName: joi.string().required().error(new Error('ItemName is required!')),
//         //         itemDescription: joi.string().required().error(new Error('ItemDescription is required!')),
//         //         quantity: joi.string().required().error(new Error('Quantity is required!')),
//         //         price: joi.string().required().error(new Error('Price is required!')),
//         //         workType: joi.string().required().error(new Error('WorkType is required!')),
//         //         discount: joi.string().required().error(new Error('Discount is required!')),
//         //         mswt: joi.string().required().error(new Error('MSWT is required!'))
//         //     }),
//         // ),
//         // Discount: joi.string().required().error(new Error('Discount is required!')),
//         // Mswt: joi.string().required().error(new Error('Mswt is required!')),
//         dueDate: joi.date().allow(null, "").error(new Error('enter your dueDate!')),
//         paymentMethod: joi.string().allow(null, "").error(new Error('enter your PaymentMethod!')),
//         Discount: joi.number().allow(null, "").error(new Error('Enter your discount!')),
//         // Mswt: joi.number().allow(null, "").error(new Error('Enter your Mswt!')),
//         notes: joi.string().allow(null, "").error(new Error('Enter Your Notes!')),
//         qrCode: joi.boolean().default(false),
//         payPal: joi.boolean().default(false),
//         depositeRequest: joi.boolean().default(false)
//     })
//     Schema.validateAsync(req.body).then(result => {
//         return next()
//     }).catch(error => {
//         res.status(400).json(new apiResponse(400, error.message, {}, {}))
//     })
// }
