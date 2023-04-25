import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { draftInvoiceModel, userModel, supplierModel, expenseModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require('mongoose').Types.ObjectId;

export const getuser = async (req: Request, res: Response) => {
    let { user }: any = req.headers
    let { limit, page, search } = req.body,
        skip: number,
        match: any = {}
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        if (search && search != "") {
            let name: Array<any> = []
            search = search.split("")
            await search.forEach(data => {
                name.push({ name: { $regex: data, $options: 'si' } })
            });
            match.$or = [{ $and: name }]
        }
        let response = await userModel.aggregate([
            { $match: { userType: 0, isActive: true, ...match } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ])
        let count = await userModel.countDocuments({ isActive: true }, match)
        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('user'), null, {}))
        } else {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('user'), {
                response,
                state: {
                    page,
                    limit,
                    page_limit: Math.ceil(count / limit),
                    data_count: count
                }
            }, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
    }
}