import mongoose from 'mongoose'

const draftInvoiceSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    billTo: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    invoiceNo: { type: String, default: null },
    dueDate: { type: Date, default: null },
    paymentMethod: { type: String, default: null },
    notes: { type: String, default: null },
    payPal: { type: Boolean, default: false },
    depositeRequest: { type: Boolean, default: false },
    qrCode: { type: Boolean, default: false },
    qrLink: { type: String, default: null },
    paid: { type: Boolean, default: false },
    pdfUrl: { type: String, default: true },
    itemTotal: { type: Number, defaul: 0 },
    Discount: { type: Number, default: 0 },
    sendBy: { type: Number, enum: [0, 1, 2], default: null }, //0-email, 1-sms, 2-post
    Total: { type: Number, defaul: 0 },
    // Mswt: { type: Number, default: 0 },

    threeDaysBefore: { type: Date, default: null },
    sevenDaysBefore: { type: Date, default: null },
    threeDaysAfter: { type: Date, default: null },
    sevenDaysAfter: { type: Date, default: null },
    // preferencesOnDueDate: { type: Boolean, default: false },
    // preferencesThreeDaysBefore: { type: Boolean, default: false },
    // preferencesThreeDaysAfter: { type: Boolean, default: false },
    // preferencesSevenDaysAfter: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    depositeAmount: { type: String, default: null },
    depositePercentage: { type: String, default: null },
}, { timestamps: true }
)

export const draftInvoiceModel = mongoose.model('draftInvoice', draftInvoiceSchema);