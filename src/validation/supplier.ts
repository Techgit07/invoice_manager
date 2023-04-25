import { Request, Response } from "express";
import Joi from "joi";
import { apiResponse } from "../common";

export const addSupplier = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        supplierName: Joi.string().required().error(new Error("supplierName is Required Field")),
        mobile: Joi.string().allow(null, "").error(new Error("Add Your Mobile!")),
        email: Joi.array().allow(null, "").error(new Error('Add Your Email!')),
        streetName: Joi.string().allow(null, "").error(new Error("Add Your streetName!")),
        additionalLine: Joi.string().allow(null, "").error(new Error("Add Your additionalLine!")),
        postCode: Joi.string().allow(null, "").error(new Error("Add Your postCode!")),
        City: Joi.string().allow(null, "").error(new Error("Add Your City!")),
        country: Joi.string().allow(null, "").error(new Error("Add Your country!")),
        webSite: Joi.string().allow(null, "").error(new Error("Add Your Website!")),
        payTerms: Joi.number().allow(null, "").error(new Error("Add Your payTerms!")),
        Note: Joi.string().allow(null, "").error(new Error("Add Your PaymentNote!")),
    })
    schema.validateAsync(req.body).then(() => {
        return next()
    }).catch(err => {
        return res.status(400).json(new apiResponse(400, err.message, null, err))
    })
}