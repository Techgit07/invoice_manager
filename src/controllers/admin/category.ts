"use strict"
import { categoryModel } from '../../database/index'
import { apiResponse } from '../../common'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { responseMessage } from '../../helper/response'

const ObjectId: any = mongoose.Types.ObjectId

export const addCategory = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    body.createdBy = ObjectId(user?._id)
    try {
        let data = await categoryModel.create(body)
        if (data) {
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('category'), data, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    let { user }: any = req.headers,
        body = req.body
    body.updatedBy = ObjectId(user?._id)
    try {
        let data = await categoryModel.findOneAndUpdate({ _id: ObjectId(body?.id), isActive: true }, body, { new: true })
        if (data) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('category'), data, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.updateDataError('category'), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    let { id } = req.params
    try {
        let data = await categoryModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, { isActive: false }, { new: true })
        if (data) {
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('category'), data, {}))
        } else { return res.status(403).json(new apiResponse(403, responseMessage?.deleteDataError, null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const categoryById = async (req: Request, res: Response) => {
    let { id } = req.params
    try {
        let data = await categoryModel.findOne({ _id: ObjectId(id), isActive: true })
        if (data) {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('category'), data, {}))
        } else { return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('category'), null, {})) }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const getCategory = async (req: Request, res: Response) => {
    let { user }: any = req.headers
    let body: any = req.body,
        { search, limit, page } = req.body,
        match: any = { isActive: true },
        skip = ((parseInt(page) - 1) * parseInt(limit))
    try {
        if (search && search != "") {
            let categoryName: Array<any> = []
            search = search.split(" ")
            await search.forEach(data => {
                categoryName.push({ categoryName: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: categoryName }];
        }

        let response = await categoryModel.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: match },
            { $skip: skip },
            { $limit: limit },
        ])
        let get_Category = await categoryModel.countDocuments(match)
        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("category"), {
            response,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(get_Category / (limit) as number)
            }
        }, {}));
        else return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("category"), {}, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}