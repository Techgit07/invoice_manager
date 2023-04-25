"use strict"
import express, { Router } from 'express';
import { userController } from '../controllers';
import { userJWT } from '../helper';
import * as validation from '../validation';
const routes = express.Router();

// ---01 (live)
// routes.get('/paypal_login_only', userController.paypal_login_only);
routes.get('/paypal_callback', userController.paypal_callback);
routes.get('/paypal_refreshToken', userController.paypal_refreshToken);

routes.post('/get_paypal_profile', userController.get_paypal_profile);

// ---02 (local)
// routes.get('/payment/paypal', userController.paypal_payment);
// routes.get('/paypal_success', userController.paypal_success);
// routes.get('/paypal_failed', userController.paypal_failed);

routes.use(userJWT);

///  fake get api
routes.get('/fake_get_api', userController.fakeGetAPI);

// ----homeRoutes
routes.post('/invoice', userController.invoice);
routes.get('/expense', userController.expense);

// ----profileRoutes
routes.get('/profile/get', userController.getProfile);
routes.put('/profile/update', userController.updateProfile);
routes.delete('/profile/delete', userController.deleteProfile);

// ----customerRoutes
routes.post('/customer/add', validation.addCustomer, userController.addCustomer);
routes.get('/customer/get', userController.getCustomer);
routes.get('/customer/get/:id', validation.by_Id, userController.customerById);
routes.put('/customer/update', validation.updateCustomer, userController.updateCustomer);
routes.delete('/customer/delete/:id', validation.by_Id, userController.deleteCustomer);

// ----supplierRoutes
routes.post('/supplier/add', validation.addSupplier, userController.addSupplier);
routes.get('/supplier/get', userController.getSupplier);
routes.get('/supplier/get/:id', validation.by_Id, userController.supplierById);
routes.get('/supplier/get/:id', validation.by_Id, userController.customerById);
routes.delete('/supplier/delete/:id', validation.by_Id, userController.deleteSupplier);

// ----itemRoutes
routes.post('/invoiceitem/add', userController.addInvoiceItem);
routes.post('/invoiceitem/get', userController.getInvoiceItems)
routes.put('/invoiceitem/update', userController.itemUpdate);
routes.delete('/items/delete/:id', userController.deleteItem);

// ----invoiceRoutes
routes.post('/draftinvoice/add', userController.addDraftInvoice);
routes.put('/invoice/update', userController.updateInvoice);
routes.delete('/invoice/delete/:id', validation.by_Id, userController.deleteInvoice);
routes.get('/draftinvoice/get', userController.getDraftInvoice);
routes.get('/invoice/get/:id', validation.by_Id, userController.invoiceById);
// routes.post('/sendbymail/invoice', userController.invoicesendBy_Mail);

// ----expenseRoutes
routes.post('/expense/add', validation.addExpense, userController.addExpense);
routes.get('/expense/get', userController.getExpense);
routes.get('/expense/get/:id', validation.by_Id, userController.expenseById);
routes.delete('/expense/delete/:id', validation.by_Id, userController.deleteExpense);
routes.put('/expense/update', userController.updateExpense);
routes.get('/get/category', userController.getCategory);

// ----payrecordRoutes
routes.post('/payRecord/expense', userController.addPayRecordExpense);
routes.post('/payRecord/invoice', userController.addPayRecordInvoice);
// routes.get('/payRecord/get', userController.getPayRecord);

// ----pdfSendRoute
routes.post('/invoiceby/mail/:id', userController.sendByMail);
routes.post('/invoiceby/sms/:id', userController.sendBySms);
routes.post('/post/send/:customerId/:invoiceId', userController.post_send);
routes.post('/receipt/send/:id', userController.recieptSend);


export const userRouter = routes;