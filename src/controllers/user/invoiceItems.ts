import { Request, response, Response } from "express";
import { draftInvoiceModel, customerModel, userModel, payRecordModel, invoiceItemModel } from "../../database";
import { apiResponse } from "../../common";
import { responseMessage, /*invoicePDF,*/ invoiceByMail_PDF } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const addInvoiceItem = async (req: Request, res: Response) => {
    let { invoiceId, item, Discount, Mswt, billTo, saveLater } = req.body,
        { user }: any = req.headers
    try {
        let draftInvoiceData = await draftInvoiceModel.findOneAndUpdate({ _id: ObjectId(invoiceId), isActive: true }, { Discount, Mswt, /*$inc: { itemTotal: item?.length }*/ })
        if (!draftInvoiceData)
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('invoiceId'), {}, {}))
        item = await item.map(data => {

            data.invoiceId = ObjectId(invoiceId)
            data.billTo = ObjectId(billTo)
            data.createdBy = ObjectId(user?._id)

            // let price = data.price * data.quantity
            // console.log(price, "price");

            // let textPrice = price + (((price * data.mswt) / 100))
            // // || ((price * data.fix) / 100))
            // console.log(textPrice, "text price");

            // data.total = textPrice - ((textPrice * data.discount) / 100)
            // console.log(data.total);

            // // console.log(">>>>>>>>>>>>>yh", data)

            let price = data.price * data.quantity,
                discountPrice = price - ((price * data.discount) / 100 || ((price * data.fix) / 100))
            data.total = discountPrice + ((discountPrice * data.mswt) / 100)
            return data
        })
        // console.log(item, "item");

        await invoiceItemModel.insertMany(item)
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('invoiceItem'), item, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const addInvoiceItem = async (req: Request, res: Response) => {
//     let { user }: any = req.headers,
//         body = req.body
//     body.createdBy = ObjectId(user?._id)
//     try {
//         for (let i = 0; i < body.item.length; i++) {
//             let price = (body.item[i].price * body.item[i].quantity),
//                 discountPrice = price - ((price * body.item[i].discount) / 100)
//             body.item[i].total = Math.round(discountPrice + ((discountPrice * body.item[i].mswt) / 100))
//         }
//         let response = await invoiceItemModel.insertMany(body)
//         if (response) {
//             return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('item'), response, {}))
//         } else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, {}, {})) }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
//     }
// }

// export const addInvoiceItem = async (req: Request, res: Response) => {
//     let body = req.body,
//         { user }: any = req.headers
//     body.createdBy = ObjectId(user?._id);
//     try {
//         let isExist: any = await invoiceItemModel.findOne({ invoiceId: ObjectId(body.invoiceId) })
//         if (!isExist) {
//             for (let i = 0; i < body.item.length; i++) {
//                 let price = (body.item[i].price * body.item[i].quantity),
//                     discountPrice = price - ((price * body.item[i].discount) / 100)
//                 body.item[i].total = Math.round(discountPrice + ((discountPrice * body.item[i].mswt) / 100))
//             }
//             body.itemTotal = 0
//             for (let i = 0; i < body.item.length; i++) {
//                 body.itemTotal += Math.round(body.item[i].total);
//             }
//             let mainDiscount = body.itemTotal - ((body.itemTotal * body.Discount) / 100)
//             body.Total = Math.round(mainDiscount + ((mainDiscount * body.Mswt) / 100))

//             let response: any = await invoiceItemModel.create(body);
//             if (response) {
//                 return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('invoiceitem'), response, {}))
//             } else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {})) }
//         }
//         else {
//             // let itemAdd: any = await (await invoiceItemModel.findOneAndUpdate({ invoiceId: ObjectId(body.invoiceId), isActive: true }, { $push: { item: body.item } }, { new: true }))
//             // for (let i = 0; i < itemAdd.item.length; i++) {
//             //     let price = (itemAdd.item[i].price * itemAdd.item[i].quantity),
//             //         discountPrice = price - ((price * itemAdd.item[i].discount) / 100)
//             //     itemAdd.item[i].total = Math.round(discountPrice + ((discountPrice * itemAdd.item[i].mswt) / 100))
//             // }
//             // itemAdd.itemTotal = 0
//             // for (let i = 0; i < itemAdd.item.length; i++) {
//             //     itemAdd.itemTotal += Math.round(itemAdd.item[i].total);
//             // }
//             // let mainDiscount = itemAdd.itemTotal - ((itemAdd.itemTotal * itemAdd.Discount) / 100)
//             // itemAdd.Total = Math.round(mainDiscount + ((mainDiscount * itemAdd.Mswt) / 100))

//             // await invoiceItemModel.findOneAndUpdate({ invoiceId: ObjectId(body.invoiceId), isActive: true }, itemAdd, { new: true });
//             // if (itemAdd) {
//             //     return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('invoiceitem'), itemAdd, {}))
//             // } else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {})) }
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const itemUpdate = async (req: Request, res: Response) => {
    let body = req.body,
        { user }: any = req.headers
    body.updatedBy = ObjectId(user?._id)
    try {
        let price = body.price * body.quantity,
            discountPrice = price - (((price * body.discount) / 100) || ((price * body.fix) / 100))
        body.total = discountPrice + ((discountPrice * body.mswt) / 100)

        let response: any = await invoiceItemModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), _id: ObjectId(body.id) }, body, { new: true });
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('invoiceitem'), response, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const deleteItem = async (req: Request, res: Response) => {
//     let { id } = req.params,
//         body = req.body,
//         { user }: any = req.headers
//     try {
//         let data: any = await invoiceItemModel.findOneAndUpdate({ invoiceId: ObjectId(id), isActive: true }, { $pull: { item: { _id: ObjectId(body.itemId) } } }, { multi: true })
//         if (data) {
//             await invoiceItemModel.findOneAndUpdate({ invoiceId: ObjectId(data.invoiceId), isActive: true }, { data }, { new: true });
//             return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('item'), { data }, {}));
//         } else { return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, null, {})); }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const deleteItem = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        id = req.params
    try {
        let response = await invoiceItemModel.findOneAndUpdate({ createdBy: ObjectId(user?._id), _id: ObjectId(id), isActive: true }, { isActive: false }, { new: true });
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('item'), response, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

// export const itemUpdate = async (req: Request, res: Response) => {
//     let body = req.body,
//         { user }: any = req.headers
//     body.createdBy = ObjectId(user?._id)
//     try {
//         let itemAdd: any = await invoiceItemModel.findOneAndUpdate({ invoiceId: ObjectId(body.invoiceId), isActive: true }, { $push: { item: body.item } }, { new: true })
//         if (itemAdd) {
//             return res.status(200).json(new apiResponse(200, responseMessage?.getDataNotFound('invoiceitem'), {}, {}))
//         }
//         for (let i = 0; i < itemAdd.item.length; i++) {
// let price = (itemAdd.item[i].price * itemAdd.item[i].quantity),
//     discountPrice = price - ((price * itemAdd.item[i].discount) / 100)
// itemAdd.item[i].total = Math.round(discountPrice + ((discountPrice * itemAdd.item[i].mswt) / 100))
//         }
//         itemAdd.itemTotal = 0
//         for (let i = 0; i < itemAdd.item.length; i++) {
//             itemAdd.itemTotal += Math.round(itemAdd.item[i].total);
//         }
//         let mainDiscount = itemAdd.itemTotal - ((itemAdd.itemTotal * itemAdd.Discount) / 100)
//         itemAdd.Total = Math.round(mainDiscount + ((mainDiscount * itemAdd.Mswt) / 100))

//         await invoiceItemModel.findOneAndUpdate({ invoiceId: ObjectId(body.invoiceId), isActive: true }, itemAdd, { new: true });
//         return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('invoiceitem'), itemAdd, {}))
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

// export const deleteItem = async (req: Request, res: Response) => {
//     let { id } = req.params,
//         body = req.body,
//         { user }: any = req.headers
//     try {
//         let data = await invoiceItemModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false }, { multi: true })
//         if (data) {
//             return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('invoiceitem'), response, {}));
//         } else { return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError('invoiceitem'), {}, {})); }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

export const getInvoiceItems = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        { body, search, saveLater } = req.body,
        match: any = {}
    try {
        // let itm: any = await invoiceItemModel.findOne({ createdBy: ObjectId(user?._id), isActive: true }).populate('billTo')
        // console.log("====================================itm", itm.billTo._id);

        if (search && search != "") {
            let itemNameArray: Array<any> = []
            search = search.split("")
            await search.forEach(data => {
                itemNameArray.push({ itemName: { $regex: data, $options: 'si' } })
            });
            match.$or = [{ $and: itemNameArray }]
        }
        if (saveLater == true) {
            let saveLater: any = await invoiceItemModel.find({ createdBy: ObjectId(user?._id), /*_id: itm.billTo._id,*/ saveLater: true, isActive: true, })
            // console.log("-----------------saveLater", saveLater._id);
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('saveLaterItem'), saveLater, {}))
        }
        let response: any = await invoiceItemModel.find({ createdBy: ObjectId(user?._id), isActive: true, ...match });
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('items'), response, {}));
        } else { return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('items'), null, {})); }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
}
