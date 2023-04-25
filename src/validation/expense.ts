"use strict"
import * as Joi from 'joi'
import { apiResponse } from '../common';
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express';

export const addExpense = async (req: Request, res: Response, next: any) => {
    const Schema = Joi.object({
        supplierTo: Joi.string().allow(null, "").error(new Error("Enter supplier Id!")),
        // title: Joi.string().required().error(new Error('Title is required!')),
        price: Joi.number().allow(null, "").error(new Error('Enter Price!')),
        date: Joi.date().allow(null, "").error(new Error('Enter date!')),
        category: Joi.string().allow(null, "").error(new Error('Enter category!')),
        description: Joi.string().allow(null, "").error(new Error('Enter Your description!')),
        image: Joi.string().allow(null, "").error(new Error('Upload Your image!')),
        paid: Joi.boolean().default(false)
    })
    Schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const by_Id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    return next()
}