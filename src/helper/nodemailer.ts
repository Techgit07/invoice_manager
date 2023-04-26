import nodemailer from 'nodemailer'
import config from 'config'

const mail: any = config.get('nodeMail')
// console.log(mail);

const option = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: mail.mail,
        pass: mail.password
    }
}
const transporter = nodemailer.createTransport(option);

export const forgotPassword_mail = async (mail_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOption = {
                from: mail.mail,
                to: mail_data?.email,
                subject: "Invoice Manager Sign_Up OTP Here",
                html: `<html lang="en-US">
                <head>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <title>Invoice Sign up OTP</title>
                    <meta name="description" content="Invoice Sign up OTP.">
                    <style type="text/css">
                        a:hover {
                            text-decoration: underline !important;
                        }
                    </style>
                </head>
                <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                        <tr>
                            <td>
                                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                    align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:0 35px;">
                                                        <h1
                                                            style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                            Invoice OTP Verification</h1>
                                                        <span
                                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                        <p
                                                            style="color:#455056; font-size:15px;line-height:24px;text-align:left; margin:0;">
                                                            Hi ${mail_data.email},
                                                            <br><br>
                                                            Your Verification OTP For Invoice Manager App Sign up is <span style: "font-weight:700, color: #1e1e2d">${mail_data.otp}. </span>Please do
                                                            not share it anyone.
                                                            <br><br>
                                                            Thanks & Regards<br>
                                                            Team Invoice Manager
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                          </tr>
                        </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                </body>
                
                </html>`,
            }
            transporter.sendMail(mailOption, (err, data) => {
                if (err) {
                    reject(err)
                    console.log(err);
                }
                else {
                    console.log("---forgotMail", data);
                    resolve(`Email has been sent to ${mail_data?.email}, kindly follow the instruction`);
                }
            })
        }
        catch (error) {
            console.log(error);
            reject()
        }
    })
}

export const invoiceByMail_PDF = async (mail_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let toMail = mail_data.customer[0].email
            // console.log("to----- ", toMail);
            const mailOption = {
                from: mail.mail,
                to: toMail,
                subject: `Invoice ${mail_data.invoice.invoiceNo} for Your Project due  ${mail_data.invoice.dueDate.toLocaleDateString()}`,
                attachments: [{
                    filename: 'Invoice.pdf',
                    path: `${mail_data.invoice.pdfUrl}`
                }],
                html: `<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Invoice Pdf Send Mail </title>
        <meta name="description" content="Reset Password Email Template.">
        <style type="text/css">
            a:hover {text-decoration: underline !important;}
        </style>
        </head>
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px;" leftmargin="0">
        <table cellspacing="0" border="0" cellpadding="0"  bgcolor="#ffffff" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #ffffff; max-width:670px;  margin:0 auto;" width="100%" border="0"  cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:rgb(255, 255, 255); border-radius:3px; -webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:30px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 15px;">
                                        <div style="text-align: left; margin-bottom: 30px;" >
                                            <img src="https://tapdigital.s3.us-east-1.amazonaws.com/expense/63d226a545d89a93416f5aca/1674717124720.png" style="width:20%" alt="logo">
                                        </div>
                                            <!-- <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:4px solid #CECECE; width:100px;"></span> -->
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin-bottom:10px;">
                                                Dear ${mail_data.customer[0].billingName},
                                                <br><br>
                                                I hope you're well. Please see attached invoice number ${mail_data.invoice.invoiceNo} for Your Project, which is due for payment on ${mail_data.invoice.dueDate.toLocaleDateString()}.<br/><br/>
                                        Please don't hesitate to reach out if you have any questions. 
                                                <br>
                                                Kind regards,
                                                <br>
                                                ${mail_data.user[0].name}
                                                <br>
                                                <br>
                                                Thanks,
                                                <br>
                                               Invoice Manager App
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <!-- <td style="text-align:center;"><strong>www.PrivateChefMarketPlace.com</strong></p></td> -->
                            </tr>
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        </body>
        </html>`
            }
            transporter.sendMail(mailOption, (error, data) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                else {
                    // console.log("---data", data);
                    resolve((`Email has been sent to ${mail_data?.customer[0].email}, kindly follow the instruction`))
                }
            })
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

export const receiptSend = async (mail_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let toMail = mail_data.customer[0].email
            let date = new Date().toLocaleDateString()
            // console.log("000000000uuuuuuu", date);

            // console.log("to----- ", toMail);
            const mailOption = {
                from: mail.mail,
                to: toMail,
                subject: `Receipt of invoice no.${mail_data.invoice.invoiceNo}`,
                attachments: [{
                    filename: 'Invoice.pdf',
                    path: `${mail_data.invoice.pdfUrl}`
                    // path: `https://tapdigital.s3.amazonaws.com/pdf/${mail_data.invoice._id}/Invoice.pdf`
                }],
                html: `<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Invoice Receipt Send</title>
        <meta name="description" content="Reset Password Email Template.">
        <style type="text/css">
            a:hover {text-decoration: underline !important;}
        </style>
        </head>
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px;" leftmargin="0">
        <table cellspacing="0" border="0" cellpadding="0"  bgcolor="#ffffff" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #ffffff; max-width:670px;  margin:0 auto;" width="100%" border="0"  cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:rgb(255, 255, 255); border-radius:3px; -webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:30px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 15px;">
                                            <!-- <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:4px solid #CECECE; width:100px;"></span> -->
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin-bottom:10px;">
                                                Dear ${mail_data.customer[0].billingName},
                                                <br><br>
                                                Thank you for your payment of ${mail_data.user[0].currency} ${mail_data.invoice.Total}. This receipt confirms that the invoice ${mail_data.invoice.invoiceNo}, Dated ${mail_data.invoice.dueDate.toLocaleDateString()}, has been fully paid.
                                                <br>
                                                Kindly regards,
                                                <br>
                                                ${mail_data.user[0].name}
                                                <br>
                                                <br>
                                                Thanks,
                                                <br>
                                               Invoice Manager App
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        </body>
        </html>`
            }
            transporter.sendMail(mailOption, (error, data) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                else {
                    // console.log("---data", data);
                    resolve((`Receipt has been sent to ${mail_data?.customer[0].email}, kindly follow the instruction`))
                }
            })
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

export const preferences_mail = async (mail_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let toMail = mail_data.customer.email
            // console.log("toMail============", toMail);
            const mailOption = {
                from: mail.mail,
                to: toMail,
                subject: `Invoice ${mail_data.invoice.invoiceNo} for Your Project due  ${mail_data.invoice.dueDate.toLocaleDateString()}`,
                attachments: [{
                    filename: 'Invoice.pdf',
                    path: `${mail_data.invoice.pdfUrl}`
                    // path: `https://tapdigital.s3.amazonaws.com/pdf/${mail_data.invoice._id}/Invoice.pdf`
                }],
                html: `<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Invoice Pdf Send Mail </title>
        <meta name="description" content="Reset Password Email Template.">
        <style type="text/css">
            a:hover {text-decoration: underline !important;}
        </style>
        </head>
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px;" leftmargin="0">
        <table cellspacing="0" border="0" cellpadding="0"  bgcolor="#FFFFFF" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #FFFFFF; max-width:670px;  margin:0 auto;" width="100%" border="0"  cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:rgb(255, 255, 255); border-radius:3px; -webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:30px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <!-- <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:4px solid #CECECE; width:100px;"></span> -->
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin-bottom:10px;">
                                                Dear ${mail_data.customer.billingName},
                                                <br><br>
                                                Your payment of  € ${mail_data.invoice.Total} is pending At  ${mail_data.user.name}<br/><br/>
                                        Please don't hesitate to reach out if you have any questions.
                                                <br>
                                                Kind regards,
                                                <br>
                                                ${mail_data.user.name}
                                                <br>
                                                <br>
                                                Thanks,
                                                <br>
                                               Invoice Manager App
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                                <!-- <td style="text-align:center;"><strong>www.PrivateChefMarketPlace.com</strong></p></td> -->
                            </tr>
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        </body>
        </html>`
            }
            transporter.sendMail(mailOption, (error, data) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                else {
                    // console.log("---preferences_mail", data);
                    resolve((`Email has been sent to ${mail_data?.customer[0].email}, kindly follow the instruction`))
                }
            })
        }
        catch (error) {
            console.log(error);
            reject()
        }
    })
}
