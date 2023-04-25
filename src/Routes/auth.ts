"use strict"
import express from 'express';
import { authController } from '../controllers';
import * as validation from '../validation'
import { userJWT } from '../helper';
const routes = express.Router();

// routes.post('/paypal/login', authController.paypalLogin);

//----usersignUp
routes.post('/signUp', validation.signUp, authController.signUp);

//----userAccount
routes.post('/account/add', userJWT, validation.addAccount, authController.addAccount);
routes.post('/logout', userJWT, authController.logOut);

//----userAuth
routes.post('/login', validation.login, authController.login);
routes.post('/forgot_password', validation.forgotPassword, authController.forgot_Password);
routes.post('/otp_verification', validation.otpVerification, authController.otp_Verification);
routes.post('/reset_password', validation.resetPassword, authController.reset_Password);
routes.post('/google_login', authController.google_SL);
routes.post('/facebook_login', authController.facebook_SL);
routes.post('/apple_login', authController.Apple_SL);

export const authRouter = routes;