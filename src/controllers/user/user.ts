import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { userModel, customerModel, draftInvoiceModel, expenseModel, invoiceItemModel, payRecordModel, supplierModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

//----userProfile----
export const getProfile = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    try {
        let response = await userModel.findOne({ _id: ObjectId(user?._id), isActive: true })
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("profile"), response, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("profile"), null, {})) }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}

export const updateProfile = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    try {
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(user?._id), isActive: true }, body, { new: true })
        if (response) {
            // await await draftInvoiceModel.findOneAndUpdate({ _id: response.createdBy }, { preferencesThreeDaysBefore: response.preferencesThreeDaysBefore, preferencesThreeDaysAfther: response.preferencesThreeDaysAfther, preferencessevenDaysAfter: response.preferencessevenDaysAfter }, { new: true })
            return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("profile"), response, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage.updateDataError("profile"), null, {})) }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}

export const deleteProfile = async (req: Request, res: Response) => {
    let { user }: any = req.headers
    try {
        let existData: any = await userModel.findOneAndUpdate({ _id: ObjectId(user?._id), isActive: true }, { isActive: false }, { new: true });
        if (existData) {
            await customerModel.updateMany({ createdBy: ObjectId(user?._id) }, { isActive: false }, { new: true })
            await draftInvoiceModel.updateMany({ createdBy: ObjectId(user?._id) }, { isActive: false }, { new: true })
            await expenseModel.updateMany({ createdBy: ObjectId(user?._id) }, { isActive: false }, { new: true })
            await invoiceItemModel.updateMany({ createdBy: ObjectId(user?._id) }, { isActive: false }, { new: true })
            await payRecordModel.updateMany({ createdBy: ObjectId(user?._id) }, { isActive: false }, { new: true })
            await supplierModel.updateMany({ createdBy: ObjectId(user?._id) }, { isActive: false }, { new: true })
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('Account'), existData, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {})) }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, error))
    }
}