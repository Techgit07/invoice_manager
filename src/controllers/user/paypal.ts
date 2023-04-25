import mongoose from 'mongoose'
// import async from 'async'
import config from 'config'
import { Request, Response } from 'express'
import request from 'request'
// import { reqInfo } from "../../helpers/winston_logger"
const paypal: any = require('paypal-rest-sdk')
import { apiResponse } from "../../common";
import { responseMessage } from "../../helper";
import { userModel } from '../../database'
const qs = require('querystring');

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = config.get("jwt_token_secret")
const paypal1: any = config.get("paypal");
import axios from 'axios'

console.log(paypal1.mode);
console.log(paypal1.client_id);
console.log(paypal1.client_secret);

paypal.configure({
    mode: paypal1.mode,
    client_id: paypal1.client_id,
    client_secrets: paypal1.client_secret
})

let user: any

export const fakeGetAPI = async (req: Request, res: Response) => {
    try {
        console.log("fake Get api ");

        user = req.headers.user
        return res.status(200).json(new apiResponse(200, "Fake API", { user }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
    }
}



export const paypal_callback = async (req: Request, res: Response) => {
    // let body = req.body
    console.log("callback");

    try {
        const clientId = paypal1.client_id;
        const secret = paypal1.client_secret;
        const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
        const code = req.query.code;
        axios({
            method: 'post',
            url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: `grant_type=authorization_code&code=${code}`,
        }).then(async response => {
            console.log(response.data);
            console.log(user, "user");

            let accessToken = response.data.access_token;
            let refreshToken = response.data.refresh_token;

            if (user && accessToken && refreshToken) {
                let token = await userModel.findOneAndUpdate({ _id: new ObjectId(user?._id), isActive: true }, { paypalAccessToken: accessToken, paypalRefreshToken: refreshToken }, { new: true })
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>-------------", token);

                res.redirect('http://192.168.29.23:80/user/paypal_success');
            }
            else {
                return res.status(404).json(new apiResponse(404, 'user not found or accessToken not found of paypal', {}, {}))
            }
            //         console.log("-----------------------------paypalToken", token);
        }).catch(error => {
            console.log(error);
        });

        // *******************************************************************************************
        // const code = 'req.query.code';
        // console.log("callback==============================");
        // // const tokenUrl = 'https://api.paypal.com/v1/oauth2/token';
        // // const tokenUrl = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
        // const tokenUrl = 'https://api-m.paypal.com/v1/oauth2/token';
        // // const tokenUrl = 'https://api.paypal.com/v1/identity/openidconnect/tokenservice';
        // // const tokenUrl = 'https://api.paypal.com/v1/oauth2/token';
        // console.log(Buffer.from(paypal1.client_id + ':' + paypal1.client_secret).toString('base64'), "****");
        // const headers = {
        //     'Accept': 'application/json',
        //     'Accept-Language': 'en_US',
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     'Authorization': 'Basic ' + Buffer.from(paypal1.client_id + ':' + paypal1.client_secret).toString('base64')
        // };
        // const body = {
        //     'grant_type': 'client_credentials',
        //     // 'code': code,
        //     // 'redirect_uri': 'YOUR_REDIRECT_URI'
        // };
        // // Exchange code for access token
        // request.post({
        //     url: tokenUrl,
        //     headers: headers,
        //     form: body
        //     // form: {
        //     //     grant_type: 'client_credentials',
        //     //     redirect_uri: 'http://192.168.29.29:80/user/paypal_callback'
        //     // },
        //     // auth: {
        //     //     user: client_id,
        //     //     pass: paypal1.client_secret
        //     // }
        // }, async (error: any, response: any, body: any) => {
        //     if (error) {
        //         console.log("error 1");
        //         res.send('Error: ' + error);
        //     } else {
        //         // console.log("body", body);
        //         const json = JSON.parse(body);
        //         const accessToken = json.access_token;
        //         let token = await userModel.findOneAndUpdate({ _id: new ObjectId(user?._id), isActive: true }, { paypalAccessToken: accessToken }, { new: true })

        //         console.log("-----------------------------paypalToken", token);


        //         // console.log("json", json);
        //         console.log("-------------------------------------accessToken", accessToken);
        //         // res.send("yes")
        //         // res.redirect('https://api.tapdigital.de/user/paypal_success')
        //         res.status(200).json(new apiResponse(200, accessToken, {}, {}))
        //     }
        // });
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const paypal_refreshToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;
        const auth = Buffer.from(`${paypal1.client_id}:${paypal1.client_secret}`).toString('base64');
        const tokenEndpoint = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
        const tokenRequestData = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };
        const config = {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        axios.post(tokenEndpoint, qs.stringify(tokenRequestData), config)
            .then(async (response) => {
                console.log(response.data.access_token, "accessToken using refreshToken");
                let accessToken = response.data.access_token
                if (user && accessToken) {
                    let token = await userModel.findOneAndUpdate({ _id: new ObjectId(user?._id), isActive: true }, { paypalAccessToken: accessToken }, { new: true })
                    return res.status(200).json(new apiResponse(200, token.paypalAccessToken, {}, {}))
                }
                else {
                    return res.status(404).json(new apiResponse(404, "user or accessToken of paypal is not found", {}, {}))
                }
                // console.log("-----------------------------paypalToken", token);
                // handle the new access token and refresh token in the response
            })
            .catch((error) => {
                console.error(error);
                // handle any errors that occur
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_paypal_profile = async (req: Request, res: Response) => {
    try {
        const { accessToken } = req.body
        const profileEndPoint = 'https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1'
        // const profileEndPoint = 'https://api.paypal.com/v1/identity/openidconnect/userinfo/?schema=openid'
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        };
        // Use access token to get user profile
        new Promise((resolve, reject) => {
            request.get({
                url: profileEndPoint,
                headers: headers
            }, (error, response, body) => {
                if (error) {
                    // res.send('Error: ' + error);
                    reject(error);
                } else {
                    console.log("body2", body);
                    const user = JSON.parse(body);
                    // res.send(user);
                    resolve(user);
                }
            });
        }).then((user) => {
            console.log('User user:', user);
            res.send(user);
        }).catch((error) => {
            console.error(error);
            res.status(500).send('Error getting user profile');
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}



// **************************************************************    **********************************************************
export const paypal_payment = async (req: Request, res: Response) => {
    // reqInfo(req)
    try {
        console.log("+++");

        const { amount, userName } = req.query;
        // let amount = 5
        // const amount = '100',
        //     userId = "62a03ec56e5a1e05fcd92e65",
        //     bookingId = "62ab2a9f76b1281c743bd197"

        const create_payment_json: any = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                // return_url: `http://localhost:8858/user/paypal_success?userId=${userName}&amount=${amount}`,
                return_url: `http://192.168.29.20:8858/user/paypal_success?userId=${userName}&amount=${amount}`,
                cancel_url: `http://192.168.29.20:8858/user/paypal_failed?userId=${userName}&amount=${amount}`,
                // return_url: `http://localhost/user/paypal_success?userId=${userId}&bookingId=${bookingId}&amount=${amount}`,
                // cancel_url: `http://localhost/user/paypal_failed?userId=${userId}&bookingId=${bookingId}&amount=${amount}`,
            },
            transactions: [
                {
                    "amount": {
                        currency: 'USD',
                        total: amount,
                    },
                    description: "testing user",
                },
            ],
        };
        await paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                throw error;
            } else {

                console.log("-----------------------------------1", payment);
                console.log("-----------------------------------2", payment.links);
                console.log("-----------------------------------3", payment.links.length);

                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        return res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: `Error while paypal payment...`,
            data: [],
        });
    }
};

// export const paypal_success = async (req: Request, res: Response) => {
//     try {
//         const payerId = req.query.PayerID
//         const { paymentId, userId, bookingId, amount }: any = req.query

//         const execute_payment_json: any = {
//             "payer_id": payerId,
//             "transactions": [{
//                 "amount": {
//                     "currency": "USD",
//                     "total": amount
//                 }
//             }]
//         };

//         console.log("====================")
//         console.log(req.query);
//         console.log("====================");

//         // Obtains the transaction details from paypal
//         paypal.payment.execute(paymentId, execute_payment_json, async function (error: any, payment: any) {
//             //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string response to the user.
//             if (error) {
//                 console.log(error.response);
//                 throw error
//             }
//             else {
//                 console.log(payment);
//                 return res.status(200).json(new apiResponse(200, "payment success", {}, {}))
//             }
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
//     }

// }
export const paypal_failed = async (req: Request, res: Response) => {
    // const { payerId, paymentId, userId, bookingId, amount }: any = req.query
    res.status(200).json({ msg: "failed" })
}
export const paypal_success = async (req: Request, res: Response) => {
    // const { payerId, paymentId, userId, bookingId, amount }: any = req.query
    res.status(200).json({ msg: "success" })
}

export const paypal_login_only = async (req: Request, res: Response) => {
    // user = req.headers.user
    try {
        console.log("paypal login only");
        // const redirect_uri = 'https://api.tapdigital.de/user/paypal_callback';
        // const cancelUrl = 'https://api.tapdigital.de/user/paypal_failed';
        const redirect_uri = 'https://api.tapdigital.de/user/paypal_callback';
        const cancelUrl = 'https://api.tapdigital.de/user/paypal_failed';

        const scopes = [
            'openid',
            // 'email',
            // 'address', 
            // 'phone',
            // 'https://uri.paypal.com/services/paypalattributes',
            // 'https://uri.paypal.com/services/expresscheckout'
        ];
        // console.log("+-+-+-");
        // console.log(paypal.openidConnect);
        // paypal.openidConnect.authorizeUrl
        // console.log(openid);
        const url = paypal.openIdConnect.authorizeUrl({
            'redirect_uri': redirect_uri,
            'scope': scopes.join(' ')
        })
        console.log(url, "url =============================================");
        res.redirect(url);
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}