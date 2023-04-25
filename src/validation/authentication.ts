import { Request, Response } from "express"
import { apiResponse } from "../common"
import Joi from "joi"

export const signUp = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        name: Joi.string().required().error(new Error('name is required!')),
        email: Joi.string().lowercase().required().error(new Error('email is required!')),
        password: Joi.string().trim().required().error(new Error('password is required!')),
        userType: Joi.number().required().error(new Error('userType is required!')),
        deviceToken: Joi.array().allow(null, "").error(new Error("Enter your deviceToken!")),
    })
    schema.validateAsync(req.body).then(() => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, null, error))
    })
}

export const addAccount = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        businessName: Joi.string().required().error(new Error("businessName is Required!")),
        streetName: Joi.string().required().error(new Error("streetName is Required!")),
        postCode: Joi.string().required().error(new Error("postCode is Required!")),
        city: Joi.string().required().error(new Error("city isRequired!")),
        phoneNumber: Joi.string().required().error(new Error("phoneNumber is Required!")),
        url: Joi.string().allow(null, "").error(new Error("Enter Your Website!")),
        ust_Idnr: Joi.string().allow(null, "").error(new Error("Enter Your ust_Idnr!")),
        steuer_Idnr: Joi.string().allow(null, "").error(new Error("Enter Your steuer_Idnr!")),
        amtsgericht: Joi.string().allow(null, "").error(new Error("Enter Your amtsgericht!")),
        handlesRegister: Joi.string().allow(null, "").error(new Error("Enter Your handlesRegister!")),
    })
    schema.validateAsync(req.body).then(() => next()).catch(error => {
        return res.status(400).json(new apiResponse(400, error.message, null, error))
    })
}

export const login = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('email is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
        deviceToken: Joi.array().allow(null, "").error(new Error("Enter your deviceToken!")),
    })
    schema.validateAsync(req.body).then(() => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, null, error))
    })
}

export const forgotPassword = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('Email Is Required!'))
    })
    schema.validateAsync(req.body).then(() => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, null, error))
    })
}

export const otpVerification = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('Email Is Required!')),
        otp: Joi.string().required().error(new Error('otp is required!')),
    })
    schema.validateAsync(req.body).then(() => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, null, error))
    })
}

export const resetPassword = async (req: Request, res: Response, next: Function) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('Email Is Required!')),
        password: Joi.string().required().error(new Error('password is required!')),
    })
    schema.validateAsync(req.body).then(() => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, null, error))
    })
}