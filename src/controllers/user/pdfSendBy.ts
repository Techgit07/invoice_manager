import { Request, Response } from "express";
import mongoose from "mongoose";
import { apiResponse, notification_types } from "../../common";
import shortUrl from 'node-url-shortener';
import {
  draftInvoiceModel,
  expenseModel,
  supplierModel,
  userModel,
} from "../../database";
import { postModel, customerModel, payRecordModel } from "../../database/models";
import {
  /*invoicePDF,*/ responseMessage,
  invoiceByMail_PDF,
  receiptSend,
  sendPDF,
} from "../../helper";
import { notification_to_reminder } from "../../helper/notification";

const ObjectId = mongoose.Types.ObjectId;

export const sendByMail = async (req: Request, res: Response) => {
  let { id } = req.params,
    { user }: any = req.headers,
    body = req.body
  let response: any = {};
  try {
    if (!(body.email == "")) {
      let data: any = await draftInvoiceModel.findOne({ _id: new ObjectId(id), isActive: true }).populate('billTo')
      await customerModel.findOneAndUpdate({ _id: data.billTo._id, isActive: true }, { email: body.email }, { new: true })
    }

    let data: any = await draftInvoiceModel.findOne({ _id: new ObjectId(id), isActive: true }).populate('billTo')

    if (data.billTo.email == "") {
      return res.status(404).json(new apiResponse(404, "please add your email", null, {}));
    } else {
      response = await draftInvoiceModel.aggregate([
        {
          $match: {
            createdBy: new ObjectId(user?._id),
            _id: new ObjectId(id),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "invoiceitems",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$invoiceId", "$$id"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "Item_Data",
          },
        },
        {
          $lookup: {
            from: "customers",
            let: { billTo: "$billTo" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$billTo"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "Customer_Data",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { createdBy: "$createdBy" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$createdBy"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "User_Data",
          },
        },
      ]);
    }
    console.log("respones", response);
    if (response) {
      await draftInvoiceModel.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, { sendBy: 0 }, { new: true })
      // console.log("----res", response[0].Customer_Data);
      // let pdf = await invoicePDF(response, `pdf/${response[0]?._id}`) //----invoicePDF-generate
      // console.log("------pdf", pdf);
      let record = await invoiceByMail_PDF({
        customer: response[0].Customer_Data,
        invoice: response[0],
        user: response[0].User_Data,
      });
      // console.log("-----reco", record);
      return res.status(200).json(new apiResponse(200, `${record}`, {}, {}));
    } else {
      return res
        .status(404)
        .json(
          new apiResponse(
            404,
            responseMessage.getDataNotFound("invoice"),
            null,
            {}
          )
        );
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        new apiResponse(500, responseMessage?.internalServerError, null, {})
      );
  }
};

// export const post_send = async (req: Request, res: Response) => {
//   let id = req.params.id,
//     { user }: any = req.headers;
//   try {
//     let response: any = await new postModel({ invoiceId: new ObjectId(id), createdBy: new ObjectId(user._id), isActive: true }).save();
//     if (response) {
//       await userModel.findOneAndUpdate({ _id: response.createdBy, isActive: true }, { $inc: { balance: -1 } }, { new: true })
//       return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("POST"), { response }, {}));
//     } else {
//       return res.status(404).json(new apiResponse(404, responseMessage.addDataError, null, {}));
//     }
//   } catch (error) {
//     console.log("error :>>", error);
//     return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {})
//     );
//   }
// };

// export const invoiceGenerate = async (req: Request, res: Response) => {
//     let body = req.body,
//         { id } = req.params,
//         { user }: any = req.headers
//     let response: any = {}
//     try {
//         response = await draftInvoiceModel.aggregate([
//             { $match: { createdBy: new ObjectId(user?._id), _id: new ObjectId(id), isActive: true } },
//             {
//                 $lookup: {
//                     from: "invoiceitems",
//                     let: { id: '$_id' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$invoiceId", "$$id"] },
//                                         { $eq: ["$isActive", true] },
//                                     ]
//                                 }
//                             }
//                         },
//                     ],
//                     as: "Item_Data"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "customers",
//                     let: { billTo: '$billTo' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$_id", "$$billTo"] },
//                                         { $eq: ["$isActive", true] },
//                                     ]
//                                 }
//                             }
//                         },
//                     ],
//                     as: "Customer_Data"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     let: { createdBy: '$createdBy' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$_id", "$$createdBy"] },
//                                         { $eq: ["$isActive", true] },
//                                     ]
//                                 }
//                             }
//                         },
//                     ],
//                     as: "User_Data"
//                 }
//             },
//         ])
//         if (response) {
//             let pdf = await invoicePDF(response, `pdf/${response[0]?._id}`) //----invoicePDF-generate
//             return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("invoice"), { response, pdf }, {}))
//         } else { return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("invoice"), null, {})) }
//     } catch (error) {
//         console.log('error :>>', error)
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {}))
//     }
// }

// export const sendBySms = async (req: Request, res: Response) => {
//   let { id } = req.params,
//     { user }: any = req.headers;
//   let response: any = {};
//   try {
//     response = await draftInvoiceModel.aggregate([
//       {
//         $match: {
//           createdBy: new ObjectId(user?._id),
//           _id: new ObjectId(id),
//           isActive: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "invoiceitems",
//           let: { id: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$invoiceId", "$$id"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "Item_Data",
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           let: { billTo: "$billTo" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$billTo"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "Customer_Data",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { createdBy: "$createdBy" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$createdBy"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "User_Data",
//         },
//       },
//     ]);
//     console.log("----response", response[0].Customer_Data);

//     if (response) {
//       // console.log("----res", response[0].Customer_Data);
//       // let pdf = await invoicePDF(response, `pdf/${response[0]?._id}`) //----invoicePDF-generate
//       // console.log("------pdf", pdf);
//       // let url = `https://dev4487.d1ypytzlhbaip.amplifyapp.com/pdf/${id}.pdf`;
//       await shortUrl.short(`https://dev4487.d1ypytzlhbaip.amplifyapp.com/pdf/${id}.pdf`, async (err, link) => {
//         console.log("-----Link", link);
//         let record = await sendPDF(response[0].Customer_Data[0].mobile, link);
//         console.log("-----record", record);
//         return res
//           .status(200)
//           .json(
//             new apiResponse(
//               200,
//               responseMessage.getDataSuccess("invoice"),
//               { link },
//               {}
//             )
//           );
//       })
//     } else {
//       return res
//         .status(404)
//         .json(
//           new apiResponse(
//             404,
//             responseMessage.getDataNotFound("invoice"),
//             null,
//             {}
//           )
//         );
//     }
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json(
//         new apiResponse(500, responseMessage?.internalServerError, null, {})
//       );
//   }
// };


// export const post_send = async (req: Request, res: Response) => {
//   let id = req.params.id,
//     { user }: any = req.headers;
//   try {

//     // let data :any = await 

//     let response: any = await new postModel({
//       invoiceId: new ObjectId(id),
//       createdBy: new ObjectId(user._id),
//     }).save();
//     if (response) {
//       return res
//         .status(200)
//         .json(
//           new apiResponse(
//             200,
//             responseMessage.addDataSuccess("POST"),
//             { response },
//             {}
//           )
//         );
//     } else {
//       return res
//         .status(404)
//         .json(new apiResponse(404, responseMessage.addDataError, null, {}));
//     }
//   } catch (error) {
//     console.log("error :>>", error);
//     return res
//       .status(500)
//       .json(
//         new apiResponse(500, responseMessage?.internalServerError, null, {})
//       );
//   }
// };

// export const sendByMail = async (req: Request, res: Response) => {
//   let { id } = req.params,
//     { user }: any = req.headers;
//   let response: any = {};
//   try {
//     response = await draftInvoiceModel.aggregate([
//       {
//         $match: {
//           createdBy: new ObjectId(user?._id),
//           _id: new ObjectId(id),
//           isActive: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "invoiceitems",
//           let: { id: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$invoiceId", "$$id"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "Item_Data",
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           let: { billTo: "$billTo" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$billTo"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "Customer_Data",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { createdBy: "$createdBy" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$createdBy"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "User_Data",
//         },
//       },
//     ]);
//     if (response) {
//       // console.log("----res", response[0].Customer_Data);
//       // let pdf = await invoicePDF(response, `pdf/${response[0]?._id}`) //----invoicePDF-generate
//       // console.log("------pdf", pdf);
//       let record = await invoiceByMail_PDF({
//         customer: response[0].Customer_Data,
//         invoice: response[0],
//         user: response[0].User_Data,
//       });
//       // console.log("-----reco", record);
//       return res.status(200).json(new apiResponse(200, `${record}`, {}, {}));
//     } else {
//       return res
//         .status(404)
//         .json(
//           new apiResponse(
//             404,
//             responseMessage.getDataNotFound("invoice"),
//             null,
//             {}
//           )
//         );
//     }
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json(
//         new apiResponse(500, responseMessage?.internalServerError, null, {})
//       );
//   }
// };


export const sendBySms = async (req: Request, res: Response) => {
  let { id } = req.params,
    { user }: any = req.headers,
    body = req.body
  let response: any = {};
  try {
    if (!(body.mobile == "")) {
      let data: any = await draftInvoiceModel.findOne({ createdBy: new ObjectId(user?._id), _id: new ObjectId(id), isActive: true }).populate('billTo')
      // console.log("----->>>>>daaaata", data);

      let hello = await customerModel.findOneAndUpdate({ createdBy: new ObjectId(user?._id), _id: data.billTo._id, isActive: true }, { mobile: body.mobile }, { new: true })
      // console.log("----->>>>>heeello", hello);
    }
    let data: any = await draftInvoiceModel.findOne({ _id: new ObjectId(id), isActive: true }).populate('billTo')
    // console.log("---- Mobile", data.billTo.mobile);

    if (data.billTo.mobile == "") {
      return res.status(404).json(new apiResponse(404, "Please add your number", null, {}));
    } else {
      response = await draftInvoiceModel.aggregate([
        {
          $match: {
            createdBy: new ObjectId(user?._id),
            _id: new ObjectId(id),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "invoiceitems",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$invoiceId", "$$id"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "Item_Data",
          },
        },
        {
          $lookup: {
            from: "customers",
            let: { billTo: "$billTo" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$billTo"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "Customer_Data",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { createdBy: "$createdBy" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$createdBy"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "User_Data",
          },
        },
      ]);
    }
    if (response) {
      await draftInvoiceModel.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, { sendBy: 1 }, { new: true })
      // console.log("-----.....-----", response[0]);

      // console.log("----res", response[0].Customer_Data);
      // let pdf = await invoicePDF(response, `pdf/${response[0]?._id}`) //----invoicePDF-generate
      // console.log("------pdf", pdf);
      // let url = `https://dev4487.d1ypytzlhbaip.amplifyapp.com/pdf/${id}.pdf`;
      // await shortUrl.short(`https://dev4487.d1ypytzlhbaip.amplifyapp.com/invoiceId/${id}`1, async (err, link) => {

      await shortUrl.short(`https://dev4487.d1ypytzlhbaip.amplifyapp.com/invoiceId/${id}`, async (err, link) => {
        let record: any = await sendPDF(response[0].Customer_Data[0].mobile, link);
        console.log("---------------------------------", record);
        console.log("---------------------------------", link);


        return res.status(200).json({ "message": `PDF send to the Number ${response[0].Customer_Data[0].mobile} successfully`, link })
      })
    } else {
      return res.status(403).json({ "message": "pdf sending error" })
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        new apiResponse(500, responseMessage?.internalServerError, null, {})
      );
  }
};

// export const post_send = async (req: Request, res: Response) => {
//   let body = req.body
//   let id = req.params.id,
//     { user }: any = req.headers;
//   try {
//     // let response: any = await new postModel({ invoiceId: new ObjectId(id), createdBy: new ObjectId(user._id), isActive: true }).save()
//     // console.log("----res", response);
//     // if (response) {
//     //   await userModel.findOneAndUpdate({ _id: response.createdBy, isActive: true }, { $inc: { balance: -1 } }, { new: true })
//     //   return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("POST"), { response }, {}));
//     // } 
//     // else {
//     if (Object.keys(body)?.length == 0) {

//     }
//     let data: any = await customerModel.findOne({ _id: new ObjectId(id), createdBy: new ObjectId(user?._id), isActive: true });
//     if (data.streetName == "" && data.additionalLine == "" && data.postCode == "" && data.City == "" && data.country == "") {
//       // customerModel.findOneAndUpdate({ _id: new ObjectId(id), createdBy: new ObjectId(user?._id), isActive: true }, body, { new: true })
//       return res.status(404).json(new apiResponse(404, "please enter you address ", {}, {}));
//     }
//     else {
//       let response: any = await new postModel({ customerId: new ObjectId(id), createdBy: new ObjectId(user._id), isActive: true }).save()
//       // console.log("----res", response);
//       if (response) {
//         await userModel.findOneAndUpdate({ _id: response.createdBy, isActive: true }, { $inc: { balance: -1 } }, { new: true })
//         return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("POST"), { response }, {}));
//       }
//     }
//     // }
//   } catch (error) {
//     console.log("error :>>", error);
//     return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {})
//     );
//   }
// };

// export const get_customer_address_byId = async (req: Request, res: Response) => {
//   let { user }: any = req.headers,
//     id = req.params.id
//   try {
//     let data: any = await customerModel.findOne({ _id: id, isActive: true, createdBy: user._id })
//     if (data.streetName == "" && data.additionalLine == "" && data.postCode == "", data.City == "", data.country == "") {
//       return res.status(404).json(new apiResponse(404, "plz enter you address ", {}, {}));
//     } else {
//       return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("customer address"), { data }, {}));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, null, {}))
//   }
// }

export const post_send = async (req: Request, res: Response) => {
  let body = req.body
  let id = req.params.customerId,
    invoiceId = req.params.invoiceId,
    { user }: any = req.headers;
  try {
    if (!(Object.keys(body)?.length == 0)) {
      let hello = await customerModel.findOneAndUpdate({ _id: new ObjectId(id), createdBy: new ObjectId(user?._id), isActive: true }, body, { new: true })
      // console.log("---------hello", hello);

      let data: any = await customerModel.findOne({ _id: new ObjectId(id), createdBy: new ObjectId(user?._id), isActive: true });
      // console.log("---------data", data);

      if (data.streetName == "" && data.additionalLine == "" && data.postCode == "" && data.City == "" && data.country == "") {
        return res.status(404).json(new apiResponse(404, "Please enter your address", {}, {}));
      }
      else {
        let response: any = await new postModel({ invoiceId: new ObjectId(invoiceId), customerId: new ObjectId(id), createdBy: new ObjectId(user._id), isActive: true }).save()
        if (response) {
          await draftInvoiceModel.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, { sendBy: 2 }, { new: true })
          await userModel.findOneAndUpdate({ _id: response.createdBy, isActive: true }, { $inc: { balance: -1 } }, { new: true })
          return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("POST"), { response }, {}));
        }
      }
    } else {
      let data: any = await customerModel.findOne({ _id: new ObjectId(id), createdBy: new ObjectId(user?._id), isActive: true });
      // console.log("--------data1", data);
      if (data.streetName == "" && data.additionalLine == "" && data.postCode == "" && data.City == "" && data.country == "") {
        return res.status(404).json(new apiResponse(404, "Please enter your address", {}, {}));
      }
      else {
        let response: any = await new postModel({ invoiceId: new ObjectId(invoiceId), customerId: new ObjectId(id), createdBy: new ObjectId(user._id), isActive: true }).save()
        // console.log("--------response", response);

        if (response) {
          await draftInvoiceModel.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, { sendBy: 2 }, { new: true })
          await userModel.findOneAndUpdate({ _id: response.createdBy, isActive: true }, { $inc: { balance: -1 } }, { new: true })
          return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("POST"), { response }, {}));
        }
      }
    }
  } catch (error) {
    console.log("error :>>", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {})
    );
  }
};

export const recieptSend = async (req: Request, res: Response) => {
  let { user }: any = req.headers,
    { id } = req.params,
    body = req.body
  try {
    let hello: any = await userModel.findOne({ createdBy: new ObjectId(user?._id), paymentReciept: true, isActive: true });
    // console.log("7777777777777777777777777777777", hello.paymentReciept);

    let hhh: any = await payRecordModel.findOne({})

    if (hello.paymentReciept) {
      let response: any = await draftInvoiceModel.aggregate([
        {
          $match: {
            createdBy: new ObjectId(user?._id),
            _id: new ObjectId(id),
            isActive: true,
            paid: true
          },
        },
        {
          $lookup: {
            from: "invoiceitems",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$invoiceId", "$$id"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "Item_Data",
          },
        },
        {
          $lookup: {
            from: "customers",
            let: { billTo: "$billTo" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$billTo"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "Customer_Data",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { createdBy: "$createdBy" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$createdBy"] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "User_Data",
          },
        },
      ]);

      // console.log("+_+_+_+_+_+_+response", response[0].Customer_Data);

      if (response) {
        let record = await receiptSend({
          customer: response[0].Customer_Data,
          invoice: response[0],
          user: response[0].User_Data,
        });
        // console.log("-----reco", record);
        return res.status(200).json(new apiResponse(200, `${record}`, {}, {}));
      }
    }
  } catch (error) {
    console.log("error :>>", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {})
    );
  }
}

// export const recieptSendNotification = async (req: Request, res: Response) => {
//   let { user }: any = req.headers,
//     { id } = req.params,
//     body = req.body
//   try {
//     let hello: any = await userModel.findOne({ createdBy: new ObjectId(user?._id), paymentReciept: true, isActive: true });
//     // console.log("7777777777777777777777777777777", hello.paymentReciept);

//     let hhh: any = await payRecordModel.findOne({})

//     if (hello.paymentReciept) {
//       let response: any = await draftInvoiceModel.aggregate([
//         {
//           $match: {
//             createdBy: new ObjectId(user?._id),
//             _id: new ObjectId(id),
//             isActive: true,
//             paid: true
//           },
//         },
//         {
//           $lookup: {
//             from: "invoiceitems",
//             let: { id: "$_id" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$invoiceId", "$$id"] },
//                       { $eq: ["$isActive", true] },
//                     ],
//                   },
//                 },
//               },
//             ],
//             as: "Item_Data",
//           },
//         },
//         {
//           $lookup: {
//             from: "customers",
//             let: { billTo: "$billTo" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$_id", "$$billTo"] },
//                       { $eq: ["$isActive", true] },
//                     ],
//                   },
//                 },
//               },
//             ],
//             as: "Customer_Data",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             let: { createdBy: "$createdBy" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$_id", "$$createdBy"] },
//                       { $eq: ["$isActive", true] },
//                     ],
//                   },
//                 },
//               },
//             ],
//             as: "User_Data",
//           },
//         },
//       ]);

//       // console.log("+_+_+_+_+_+_+response", response[0].Customer_Data);

//       if (response) {
//         let [customer_notification]: any = await Promise.all([
//           await notification_types.customer({ _id: new ObjectId(id), Total: response[0].Total, userName: response[0].User_Data[0].name, dueDate: response[0].dueDate })
//         ])
//         if (customer_notification) {
//           await notification_to_reminder(response[0]?.user[0], customer_notification?.template, customer_notification?.data)
//         }
//       }
//     }
//   } catch (error) {
//     console.log("error :>>", error);
//     return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, null, {})
//     );
//   }
// }