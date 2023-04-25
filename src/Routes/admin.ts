"use strict"
import express, { Router } from 'express';
import { adminController } from '../controllers';
import { userJWT } from '../helper';
import * as validation from '../validation';
import { notification } from '../validation/notification';
const routes = express.Router();

// ----- userRoute
routes.post('/user/get', adminController.getuser);

// ----- supplierRoute
routes.post('/supplier/get', adminController.getSupplier);
routes.get('/supplier/get/:id', adminController.supplierById);

// ----- customerRoute
routes.post('/customer/get', adminController.getCustomer);
routes.get('/customer/get/:id', adminController.customerById);

// ----- webView
routes.get('/web/invoice_by_id/:id', adminController.webView);

// ----- documentCount
routes.get('/count', adminController.count);

// ---- postRoute
routes.post('/get/post', adminController.getPost);
routes.post('/update/post/:id', adminController.post_status_update);

// ---- categoryRoute
routes.post('/add/category', adminController.addCategory);
routes.put('/update/category', adminController.updateCategory);
routes.delete('/delete/category/:id', adminController.deleteCategory);
routes.get('/category/by_id/:id', adminController.categoryById);
routes.post('/get/category', adminController.getCategory);

// ---- adminNotificationRoute
routes.post('/notification/sent', validation.notification, adminController.sent_selected_user_notification)

export const adminRouter = routes;  