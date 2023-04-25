"use strict"
import * as Joi from 'joi'
import { apiResponse } from '../common';
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express';

export const notification = async (req: Request, res: Response, next: any) => {
    const Schema = Joi.object({
        title: Joi.string().required().error(new Error("Enter Title!")),
        description: Joi.string().required().error(new Error('Enter Description!')),
        isAllUser: Joi.boolean().default(true),
    })
    Schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}