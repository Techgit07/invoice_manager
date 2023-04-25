import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { draftInvoiceModel, userModel, supplierModel, expenseModel, customerModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const count = async (req: Request, res: Response) => {
    let { user }: any = req.headers
    try {
        let user: any = await userModel.countDocuments({ userType: 0, isActive: true }),
            customer: any = await customerModel.countDocuments({ isActive: true }),
            supplier: any = await supplierModel.countDocuments({ isActive: true })
        if (user) {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('count'), {
                count: {
                    user: user,
                    customer: customer,
                    supplier: supplier
                }
            }, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('count'), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}