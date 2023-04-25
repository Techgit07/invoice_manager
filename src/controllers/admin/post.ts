import { Request, Response } from "express";
import mongoose from "mongoose";
import { apiResponse } from "../../common";
import {
  customerModel,
  draftInvoiceModel,
  expenseModel,
  supplierModel,
  userModel,
} from "../../database";
import { postModel } from "../../database/models/post";
import {
  /*invoicePDF,*/ responseMessage,
  invoiceByMail_PDF,
  sendPDF,
} from "../../helper";

const ObjectId = mongoose.Types.ObjectId;

// export const getPost = async (req: Request, res: Response) => {
//   try {
//     let response: any = await postModel.aggregate([
//       { $match: { isActive: true } },
//       {
//         $lookup: {
//           from: "invoiceitems",
//           let: { id: "$invoiceId" },
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
//             {
//               $project: { billingName: 1, _id: 0 },
//             },
//           ],
//           as: "customer",
//         },
//       },
//       {
//         $unwind: {
//           path: "$customer",
//         },
//       },
//       {
//         $addFields: {
//           billingName: "$customer.billingName",
//         },
//       },
//       {
//         $project: { customer: 0 },
//       },
//     ]);
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
//         .status(403)
//         .json(new apiResponse(403, responseMessage.addDataError, null, {}));
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

// export const get_post = async (req: Request, res: Response) => {
//   let { user }: any = req.headers
//   let { limit, page, search } = req.body,
//     search_match: any = {},
//     match: any = { isActive: true },
//     skip = ((parseInt(page) - 1) * parseInt(limit));
//   try {
//     if (search && search != "") {
//       let billingName: Array<any> = []
//       search = search.split(" ")
//       await search.forEach(data => {
//         billingName.push({ "invoice.customer.billingName": { $regex: data, $options: 'si' } })
//       });
//       console.log("----src", billingName);
//       search_match.$or = [{ $and: billingName }]
//       console.log("----Search", search_match);
//     }

//     let response: any = await postModel.aggregate([
//       { $match: match },
//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: parseInt(limit) },
//       {
//         $lookup: {
//           from: "draftinvoices",
//           let: { invoiceId: "$invoiceId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$invoiceId"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//             {
//               $lookup: {
//                 from: "invoiceitems",
//                 let: { id: "$_id" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $and: [
//                           { $eq: ["$invoiceId", "$$id"] },
//                           { $eq: ["$isActive", true] },
//                         ],
//                       },
//                     },
//                   },
//                 ],
//                 as: "Item_Data",
//               },
//             },
//             {
//               $lookup: {
//                 from: "customers",
//                 let: { billTo: "$billTo" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: {
//                         $and: [
//                           { $eq: ["$_id", "$$billTo"] },
//                           { $eq: ["$isActive", true] },
//                         ],
//                       },
//                     },
//                   },
//                 ],
//                 as: "customer",
//               },
//             },
//           ],
//           as: "invoice",
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
//           as: "user",
//         },
//       }, {
//         $match: search_match
//       },
//     ]);
//     let count = await postModel.countDocuments(match)
//     if (response) {
//       return res
//         .status(200)
//         .json(
//           new apiResponse(
//             200,
//             responseMessage.addDataSuccess("POST"),
//             {
//               response,
//               state: {
//                 page,
//                 limit,
//                 page_limit: Math.ceil(count / (limit) as number),
//                 data_count: count
//               }
//             },
//             {}
//           )
//         );
//     } else {
//       return res
//         .status(403)
//         .json(new apiResponse(403, responseMessage.addDataError, null, {}));
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

export const post_status_update = async (req: Request, res: Response) => {
  let id = req.params.id,
    body = req.body
  try {
    if (body.postStatus == 0) {
      let response = await postModel.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, { postStatus: 0 }, { new: true })
      return res.status(200).json(new apiResponse(200, "post is pending", response, {}));
    }
    if (body.postStatus == 1) {
      let response = await postModel.findOneAndUpdate({ _id: new ObjectId(id), isActive: true }, { postStatus: 1 }, { new: true })
      return res.status(200).json(new apiResponse(200, "post is deliever", response, {}));
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
  }
}

// export const getPost = async (req: Request, res: Response) => {
//   let { limit, page, search } = req.body,
//     match: any = { isActive: true },
//     skip = ((parseInt(page) - 1) * parseInt(limit));
//   try {

//     let response: any = await postModel.aggregate([
//       { $match: match },
//       {
//         $lookup: {
//           from: "users",
//           let: { id: "$createdBy" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$id"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "user",
//         },
//       },
//       {
//         $lookup: {
//           from: "customers",
//           let: { id: "$customerId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$_id", "$$id"] },
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: "customer",
//         },
//       },
//     ])
//     // console.log("------", response);
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
//         .status(403)
//         .json(new apiResponse(403, responseMessage.addDataError, null, {}));
//     }
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
//   }
// }

export const getPost = async (req: Request, res: Response) => {
  let { limit, page, search } = req.body,
    search_match: any = {},
    match: any = { isActive: true },
    skip = ((parseInt(page) - 1) * parseInt(limit));
  try {
    if (search && search != "") {
      let billingName: Array<any> = []
      let name: Array<any> = []
      let email: Array<any> = []
      let streetName: Array<any> = []
      search = search.split(" ")
      // await search.forEach(data => {
      //   // name.push({ "user.name": { $regex: data, $options: 'si' } })
      //   billingName.push({ "customer.billingName": { $regex: data, $options: 'si' } })
      //   // billingName.push({ "invoice.customer.billingName ": { $regex: data, $options: 'si' } })
      // });
      await search.forEach((data: any) => {
        name.push({ "user.name": { $regex: data, $options: 'si' } })
        billingName.push({ "customer.billingName": { $regex: data, $options: 'si' } })
        email.push({ "customer.email": { $regex: data, $options: 'si' } })
        streetName.push({ "customer.streetName": { $regex: data, $options: 'si' } })
      })
      // console.log("----src", billingName);
      // console.log("----src", streetName);
      search_match.$or = [{ $and: billingName }, { $and: name }, { $and: email }, { $and: streetName }]
      // console.log("----Search", search_match);
    }

    let response: any = await postModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          let: { id: "$createdBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$id"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "customers",
          let: { id: "$customerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$id"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "draftinvoices",
          let: { id: "$invoiceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$id"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "draftinvoice",
        },
      },
      {
        $match: search_match
      }
    ])
    let count = await postModel.countDocuments(match);
    // console.log("------", response);
    if (response) {
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            responseMessage.addDataSuccess("POST"),
            {
              response,
              state: {
                page,
                limit,
                page_limit: Math.ceil(count / (limit) as number),
                data_count: count
              }
            },
            {}
          )
        );
    } else {
      return res
        .status(403)
        .json(new apiResponse(403, responseMessage.addDataError, null, {}));
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
  }
}
