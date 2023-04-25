import mongoose from 'mongoose'

const payRecordSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "invoice" },
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "expense" },
    amount: { type: Number, default: null },
    date: { type: Date, default: null },
    paymentMethod: { type: Number, default: null, enum: [0, 1, 2, 3, 4] }, // 0-cash, 1-cheque, 2-directTransfer, 3-creditCard, 4-paypal
    sendReciept: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const payRecordModel = mongoose.model('payRecord', payRecordSchema);