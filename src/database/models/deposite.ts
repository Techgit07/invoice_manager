// import mongoose from "mongoose";

// const depositeSchema = new mongoose.Schema({
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
//     invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "draftInvoice" },
//     billTo: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
//     percentage: { type: String, default: null },
//     fix: { type: String, default: null },
//     amount: { type: String, default: null },
//     dueDate: { type: String, default: null },
//     isActive: { type: Boolean, default: true }
// }, { timestamps: true })

// export const depositeModel = mongoose.model('deposite', depositeSchema)