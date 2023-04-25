import fs from 'fs';
// import { upload_allType } from './s3';
import pdf from 'pdf-creator-node'

// export const invoicePDF = (body_data: any, upload_location: any) => {
//   // console.log("--->>>", body_data[0]);

//   return new Promise(async (resolve, reject) => {
//     try {
//       let html = `<!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8" />
//           <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <title>Invoice Document</title>
//           <style>
//             body {
//               margin-top: 20px;
//               background-color: #f7f7ff;
//             }
      
//             #invoice {
//               padding: 0px;
//             }
      
//             .invoice {
//               position: relative;
//               background-color: #fff;
//               min-height: 680px;
//               padding: 15px;
//             }
      
//             .invoice header {
//               padding: 10px 0;
//               margin-bottom: 20px;
//               border-bottom: 1px solid #0d6efd;
//             }
      
//             .invoice .company-details {
//               text-align: right;
//             }
      
//             .invoice .company-details .name {
//               margin-top: 0;
//               margin-bottom: 0;
//             }
      
//             .invoice .contacts {
//               margin-bottom: 20px;
//             }
      
//             .invoice .invoice-to {
//               text-align: left;
//             }
      
//             .invoice .invoice-to .to {
//               margin-top: 0;
//               margin-bottom: 0;
//             }
      
//             .invoice .invoice-details {
//               text-align: right;
//             }
      
//             .invoice .invoice-details .invoice-id {
//               margin-top: 0;
//               color: #0d6efd;
//             }
      
//             .invoice main {
//               padding-bottom: 50px;
//             }
      
//             .invoice main .thanks {
//               margin-top: -100px;
//               font-size: 2em;
//               margin-bottom: 50px;
//             }
      
//             .invoice main .notices {
//               padding-left: 6px;
//               border-left: 6px solid #0d6efd;
//               background: #e7f2ff;
//               padding: 10px;
//             }
      
//             .invoice main .notices .notice {
//               font-size: 1.2em;
//             }
      
//             .invoice table {
//               width: 100%;
//               border-collapse: collapse;
//               border-spacing: 0;
//               margin-bottom: 20px;
//             }
      
//             .invoice table td,
//             .invoice table th {
//               padding: 15px;
//               background: #eee;
//               border-bottom: 1px solid #fff;
//             }
      
//             .invoice table th {
//               white-space: nowrap;
//               font-weight: 400;
//               font-size: 16px;
//             }
      
//             .invoice table td h3 {
//               margin: 0;
//               font-weight: 400;
//               color: #0d6efd;
//               font-size: 1.2em;
//             }
      
//             .invoice table .qty,
//             .invoice table .total,
//             .invoice table .unit {
//               text-align: right;
//               font-size: 1.2em;
//             }
      
//             .invoice table .no {
//               color: #fff;
//               font-size: 1.6em;
//               background: #0d6efd;
//             }
      
//             .invoice table .unit {
//               background: #ddd;
//             }
      
//             .invoice table .total {
//               background: #0d6efd;
//               color: #fff;
//             }
      
//             .invoice table tbody tr:last-child td {
//               border: none;
//             }
      
//             .invoice table tfoot td {
//               background: 0 0;
//               border-bottom: none;
//               white-space: nowrap;
//               text-align: right;
//               padding: 10px 20px;
//               font-size: 1.2em;
//               border-top: 1px solid #aaa;
//             }
      
//             .invoice table tfoot tr:first-child td {
//               border-top: none;
//             }
      
//             .card {
//               position: relative;
//               display: flex;
//               flex-direction: column;
//               min-width: 0;
//               word-wrap: break-word;
//               background-color: #fff;
//               background-clip: border-box;
//               border: 0px solid rgba(0, 0, 0, 0);
//               border-radius: 0.25rem;
//               margin-bottom: 1.5rem;
//               box-shadow: 0 2px 6px 0 rgb(218 218 253 / 65%),
//                 0 2px 6px 0 rgb(206 206 238 / 54%);
//             }
      
//             .invoice table tfoot tr:last-child td {
//               color: #0d6efd;
//               font-size: 1.4em;
//               border-top: 1px solid #0d6efd;
//             }
      
//             .invoice table tfoot tr td:first-child {
//               border: none;
//             }
      
//             .invoice footer {
//               width: 100%;
//               text-align: center;
//               color: #777;
//               border-top: 1px solid #aaa;
//               padding: 8px 0;
//             }
      
//             @media print {
//               .invoice {
//                 font-size: 11px !important;
//                 overflow: hidden !important;
//               }
      
//               .invoice footer {
//                 position: absolute;
//                 bottom: 10px;
//                 page-break-after: always;
//               }
      
//               .invoice > div:last-child {
//                 page-break-before: always;
//               }
//             }
      
//             .invoice main .notices {
//               padding-left: 6px;
//               border-left: 6px solid #0d6efd;
//               background: #e7f2ff;
//               padding: 10px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="card">
//               <div class="card-body">
//                 <div id="invoice">
//                   <div class="invoice overflow-auto">
//                     <div style="min-width: 600px">
//                       <header>
//                         <div class="row">
//                           <div class="col">
//                             <a href="javascript:;">
//                               <img
//                                 src="assets/images/logo-icon.png"
//                                 width="80"
//                                 alt=""
//                               />
//                             </a>
//                           </div>
//                           <div class="col company-details">
//                             <h2 class="name">${body_data[0].User_Data[0].name}</h2>
//                             <div>${body_data[0].User_Data[0].phoneNumber}</div>
//                             <div>${body_data[0].User_Data[0].email}</div>
//                           </div>
//                         </div>
//                       </header>
//                       <main>
//                         <div class="row contacts">
//                           <div class="col invoice-to">
//                             <div class="text-gray-light">Invoice To:</div>
//                             <h2 class="to"></h2>
//                             <div class="address"></div>
//                             <div class="email">
//                               <h4 class="to">
//                                 ${body_data[0].Customer_Data[0].billingName}
//                               </h4>
//                             </div>
//                           </div>
//                           <div class="col invoice-details">
//                             <div class="text-gray-light">Invoice No:</div>
//                             <h4 class="to">${body_data[0].invoiceNo}</h4>
//                             <div class="date">
//                               <div class="text-gray-light">Due Date:</div>
//                               <h4 class="to">
//                                 ${body_data[0].dueDate.toLocaleDateString()}
//                               </h4>
//                             </div>
//                           </div>
//                         </div>
//                         <table>
//                           <thead>
//                             <tr>
//                               <th>Index</th>
//                               <th class="text-left">Name</th>
//                               <th class="text-right">Description</th>
//                               <th class="text-right">Quantity</th>
//                               <th class="text-right">Price</th>
//                               <th class="text-right">Discount%</th>
//                               <th class="text-right">Mswt%</th>
//                               <th class="text-right">Total</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             ${body_data[0].Item_Data.map((Item_Data: any, i: any) => {
//         return `<tr class=${i % 2 == 0 ? "Item_Data_1" : "Item_Data_2"}>
//                                        <td>${i + 1}</td>
//                                        <td>${Item_Data.itemName}</td>
//                                       <td>${Item_Data.itemDescription}</td>
//                                       <td>${Item_Data.quantity}</td>
//                                       <td>${Item_Data.price}</td>
//                                       <td>${Item_Data.discount}</td>
//                                       <td>${Item_Data.mswt}</td>
//                                       <td>${Item_Data.total}</td>
//                                     </tr>`})}
//                           </tbody>
//                         </table>
//                         <!-- <div class="thanks">Thank you!</div> -->
//                         <div class="notices">
//                           <div>NOTICE:</div>
//                           <div class="notice">
//                             A finance charge of 1.5% will be made on unpaid balances
//                             after 30 days.
//                           </div>
//                         </div>
//                       </main>
//                       <footer>
//                         Invoice was created on a computer and is valid without the
//                         signature and seal.
//                       </footer>
//                     </div>
//                     <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
//                     <div></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </body>
//       </html>`
//       const filename = 'Invoice.pdf'
//       const document = {
//         html: html,
//         data: {
//           details: [body_data[0]]
//         },
//         path: './' + filename
//       }
//       await pdf.create(document, {
//         orientation: "potarait",
//         format: "A4",
//       })

//       //---- AWS Location
//       let location = await upload_allType({
//         data: fs.readFileSync(process.cwd() + `/${filename}`),
//         name: filename,
//         mimetype: 'application/pdf'
//       }, upload_location)
//       fs.unlinkSync(process.cwd() + `/${filename}`)
//       return resolve(location)
//     } catch (error) {
//       console.log(error);
//       reject()
//     }
//   })
// }
