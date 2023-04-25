import { Request, response, Response } from "express";
import { userModel, customerModel } from "../../database";
import { responseMessage, forgotPassword_mail } from "../../helper";
import { apiResponse } from "../../common";
import config from 'config'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from "axios";

const ObjectId = require('mongoose').Types.ObjectId;
const jwt_token_secret = config.get('jwt_token_secret')

export const signUp = async (req: Request, res: Response) => {
    let body = req.body
    try {
        let existingMail = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { $addToSet: { deviceToken: body?.deviceToken } }, { new: true });
        if (!existingMail) {
            const salt = await bcryptjs.genSaltSync(8);
            const hashPassword = await bcryptjs.hash(body.password, salt);
            body.password = hashPassword
            let response = await userModel.create(body);
            if (response) {
                const token = jwt.sign({
                    _id: response._id,
                    status: "Login",
                    generatedOn: (new Date().getTime())
                }, jwt_token_secret)
                return res.status(200).send(new apiResponse(200, responseMessage?.addDataSuccess('userData'), { body, token }, {}))
            } else { return res.status(403).send(new apiResponse(403, responseMessage?.addDataError, null, {})) }
        } else { return res.status(409).send(new apiResponse(409, responseMessage?.alreadyEmail, null, {})) }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}

export const addAccount = async (req: Request, res: Response) => {
    let body = req.body,
        { user }: any = req.headers
    try {
        let randomNumber = Math.floor(30000000 + Math.random() * 50000000);
        body.accountId = randomNumber
        let existData: any = await userModel.findOneAndUpdate({ _id: ObjectId(user?._id), isActive: true }, body, { new: true });
        if (existData) {
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('Account'), {
                _id: existData.id,
                email: existData.email,
                accountId: existData.accountId,
                businessName: existData.businessName,
                streetName: existData.streetName,
                postCode: existData.postCode,
                city: existData.city,
                phoneNumber: existData.phoneNumber,
                url: existData.url,
                ust_Idnr: existData.ust_Idnr,
                steuer_Idnr: existData.steuer_Idnr,
                amtsgericht: existData.amtsgericht,
                handlesRegister: existData.handlesRegister
            }, {}))
        }
        else { return res.status(403).json(new apiResponse(403, responseMessage?.addDataError, null, {})) }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, error))
    }
}

export const forgot_Password = async (req: Request, res: Response) => {
    let body = req.body
    let response: any
    try {
        let isExist: any = await userModel.findOne({ email: body.email, isActive: true });
        if (!isExist) { return res.status(403).json(new apiResponse(403, responseMessage?.invalidEmail, null, {})); }
        else {
            let otp = Math.floor(300000 + Math.random() * 500000)
            if (body.email == isExist.email) {
                response = await forgotPassword_mail({ email: isExist.email, otp });
                if (response) {
                    await userModel.findOneAndUpdate({ email: body.email }, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) });
                    return res.status(200).json(new apiResponse(200, `${response}`, {}, {}));
                } else return res.status(403).json(new apiResponse(403, responseMessage.errorMail, null, `${response}`));
            }
        }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}

export const otp_Verification = async (req: Request, res: Response) => {
    let body = req.body
    try {
        let isExist: any = await userModel.findOne({ email: body.email, isActive: true })
        if (!isExist) { return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail, null, {})) }
        else {
            if (body.email == isExist.email) {
                let OTP = await userModel.findOne({ otp: body.otp, isActive: true });
                if (OTP) {
                    await userModel.findOneAndUpdate({ otp: body.otp, isActive: true }, { otp: null, otpExpireTime: null })
                    if (new Date(isExist.otpExpireTime).getTime() < new Date().getTime()) {
                        return res.status(410).json(new apiResponse(410, responseMessage.expireOTP, null, {}))
                    } return res.status(200).json(new apiResponse(200, responseMessage.OTPverified, {}, {}))
                } else { return res.status(404).json(new apiResponse(404, responseMessage.invalidOTP, null, {})) }
            }
        }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, error))
    }
}

export const reset_Password = async (req: Request, res: Response) => {
    let body = req.body,
        id = body.id
    try {
        const salt = await bcryptjs.genSaltSync(10),
            hashPassword = await bcryptjs.hash(body.password, salt)
        body.password = hashPassword
        let isExist: any = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, body, { new: true })
        if (isExist) {
            return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, { action: "please go to login page" }, {}))
        } else { return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, isExist, {})) }
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, error));
    }
}

export const google_SL = async (req, res) => {
    let { accessToken, idToken, deviceToken } = req.body
    try {
        if (accessToken && idToken) {
            // console.log("bhai");

            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
                idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;

            let access_token: any = await axios.get(verificationAPI)
                .then((result) => {
                    console.log(" result.data", result.data);
                    return result.data
                }).catch((error) => {
                    console.log(error.response?.data);
                    return false;
                })

            let id_token: any = await axios.get(idAPI)
                .then((result) => {
                    console.log("idapi result.data", result.data);
                    return result.data
                }).catch((error) => {
                    console.log(error.response?.data);
                    return false
                })

            if (access_token.email == id_token.email && access_token.verified_email == true) {
                console.log("log", access_token.email == id_token.email);

                const isUser: any = await userModel.findOneAndUpdate({ email: id_token?.email, isActive: true }, { $addToSet: { deviceToken: deviceToken } })
                if (!isUser) {
                    return new userModel({
                        email: id_token.email,
                        name: id_token.given_name,
                        deviceToken: [deviceToken]
                    }).save()
                        .then(async (response: any) => {
                            const token = jwt.sign({
                                _id: response._id,
                                type: response.userType,
                                status: "Login Success",
                                generatedOn: (new Date().getTime())
                            }, jwt_token_secret)
                            let return_response = {
                                name: response?.name,
                                email: response?.email,
                                _id: response?._id,
                                token,
                            }
                            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response, {}));
                        })
                } else {
                    if (isUser?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}, {}));
                    const token = jwt.sign({
                        _id: isUser._id,
                        type: isUser.userType,
                        status: "Login Success",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)
                    let response = {
                        userType: isUser?.userType,
                        name: isUser?.name,
                        email: isUser?.email,
                        _id: isUser?._id,
                        token,
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}));
                }
            }
            return res.status(401).json(new apiResponse(401, responseMessage?.invalidIdTokenAndAccessToken, {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error, {}));
    }
}

export const facebook_SL = async (req, res) => {
    let { accessToken, deviceToken } = req.body
    try {
        let userURL = `https://graph.facebook.com/me?fields=first_name,last_name,email,picture&access_token=${accessToken}`
        console.log("---userURl", userURL);

        let user_profile = await axios.get(userURL)
            .then((result) => {
                console.log("---result.data", result.data);
                return result.data
            }).catch((error) => {
                console.log(error.response?.data);
                return false;
            })

        if (!user_profile) return res.status(401).json(new apiResponse(401, responseMessage?.invalidToken, {}, {}))
        let userIsExist: any = await userModel.findOneAndUpdate({ facebookId: user_profile?.id, isActive: true }, { $addToSet: { deviceToken: deviceToken } })
        console.log("---userIsExist", userIsExist);

        if (userIsExist) {
            if (userIsExist?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}, {}));
            let userIsExistUpdate: any = await userModel.findOneAndUpdate({ facebookId: user_profile?.id, isActive: true }, { isFirstTime: false }, { new: true })

            const token = jwt.sign({
                _id: userIsExistUpdate._id,
                type: userIsExistUpdate.userType,
                status: "Login Success",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret)
            let response = {
                _id: userIsExistUpdate?._id,
                userType: userIsExistUpdate?.userType,
                name: userIsExistUpdate?.name,
                email: userIsExistUpdate?.email,
                token,
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}));
        } else {
            return new userModel({
                email: user_profile.email,
                name: user_profile.first_name + "" + user_profile.last_name,
                facebookId: user_profile?.id,
                deviceToken: [deviceToken]
            }).save()
                .then(async (response: any) => {
                    const token = jwt.sign({
                        _id: response._id,
                        type: response.userType,
                        status: "Login Success",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)
                    let return_response = {
                        userType: response.userType,
                        name: response?.name,
                        email: response?.email,
                        _id: response?._id,
                        token,
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response, {}));
                })
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error, {}));
    }
}

export const Apple_SL = async (req, res) => {
    let { deviceToken, email, name, appleAuthCode, } = req.body
    try {
        let userExist: any = await userModel.findOneAndUpdate({ ...(email) && { email }, isActive: true, ...(appleAuthCode.length != 0) && { appleAuthCode } }, { $addToSet: { ...(deviceToken) && { deviceToken } } }, { new: true })
        if (!userExist) {
            return new userModel({
                email: email,
                name: name,
                deviceToken: [deviceToken],
                appleAuthCode: appleAuthCode
            }).save()
                .then(async (response: any) => {
                    const token = jwt.sign({
                        _id: response._id,
                        type: response.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, jwt_token_secret)
                    let return_response = {
                        userType: response?.userType,
                        name: response?.name,
                        email: response?.email,
                        _id: response?._id,
                        token,
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response, {}));
                })
        } else {
            if (userExist?.isBlock == true) return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}, {}));
            const token = jwt.sign({
                _id: userExist._id,
                type: userExist.userType,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret)
            let response = {
                userType: userExist?.userType,
                name: userExist?.name,
                email: userExist?.email,
                _id: userExist?._id,
                token,
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}));
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error, {}));
    }
}

// export const login = async (req: Request, res: Response) => {
//     let body = await req.body,
//         { user }: any = req.headers
//     try {
//         // let response: any = await userModel.findOne({ email: body.email, isActive: true });
//         let response: any = await userModel.findOneAndUpdate({ email: body.email, isActive: true, userType: 0 }, { $addToSet: { deviceToken: body?.deviceToken } }, { new: true });
//         console.log("----loginRes", response.userType);
//         if (!response) {
//             return res.status(403).json(new apiResponse(403, responseMessage?.invalidEmail, null, {}));
//         }
//         const passwordMatch = await bcryptjs.compare(body.password, response.password);
//         if (!passwordMatch) {
//             return res.status(403).json(new apiResponse(403, responseMessage?.invalidUserPasswordEmail, null, {}));
//         }
//         const token = jwt.sign({
//             _id: response._id,
//             status: "Login",
//             generatedOn: (new Date().getTime())
//         }, jwt_token_secret)
//         response = { response, token };
//         return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}));
//     } catch (error) {
//         console.log('error :>> ', error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}));
//     }
// }

export const login = async (req: Request, res: Response) => {
    let body = await req.body,
        { user }: any = req.headers
    try {
        // let response: any = await userModel.findOne({ email: body.email, isActive: true });
        // let response: any = await userModel.findOneAndReplace({ email: body.email, isActive: true }, { $addToSet: { deviceToken: body?.deviceToken } }, { new: true });
        let response: any = await userModel.findOne({ email: body.email, isActive: true });
        // console.log("----loginRes", response);
        if (!response) {
            return res.status(403).json(new apiResponse(403, responseMessage?.invalidEmail, null, {}));
        }
        const passwordMatch = await bcryptjs.compare(body.password, response.password);
        if (!passwordMatch) {
            return res.status(403).json(new apiResponse(403, responseMessage?.invalidUserPasswordEmail, null, {}));
        }
        const token = jwt.sign({
            _id: response._id,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        response.deviceToken = body.deviceToken
        await response.save();
        response = { response, token };
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}));
    } catch (error) {
        console.log('error :>> ', error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
}

export const logOut = async (req: Request, res: Response) => {
    let { user }: any = req.headers
    try {
        let response: any = await userModel.updateOne({ _id: ObjectId(user?._id), isActive: true }, { $pull: { deviceToken: { $in: [req.body?.deviceToken] } } });
        if (response) { return res.status(200).send(new apiResponse(200, responseMessage?.logout, { response }, {})) }
    } catch (error) { return res.status(500).send(new apiResponse(500, responseMessage?.internalServerError, {}, {})) }
}

// export const paypalLogin = async (req: Request, res: Response) => {
//     let { accessToken, userID } = req.body
//     console.log("=================", { accessToken, userID });

//     try {
//         axios({
//             method: 'get',
//             url: `https://api.paypal.com/v1/oauth2/client/${userID}`,
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${accessToken}`
//             }

//         }).then(response => {
//             // retrieve the client ID and secret ID from the response
//             const clientID = response.data.client_id;
//             console.log("---------clientId", clientID);

//             const secretID = response.data.secret;
//             console.log("---------secretID", secretID);
//             // use the client ID and secret ID to authenticate with the PayPal API
//             // ...
//         }).catch((error) => {
//             console.log("-=-=-=-=--=--=-error", error);
//             return false
//         })

//     } catch (error) {
//         console.log('error :>> ', error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}));
//     }
// }
