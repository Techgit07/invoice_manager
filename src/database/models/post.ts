import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "draftInvoice" },
    postStatus: { type: Number, default: 0, enum: [0, 1] }, // 0-pending // 1- deliever
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

export const postModel = mongoose.model("post", postSchema)