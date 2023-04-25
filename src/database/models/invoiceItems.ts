import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "draftInvoice" },
    billTo: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
    itemName: { type: String, default: null },
    itemDescription: { type: String, default: null },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    workType: { type: Number, default: null, enum: [0, 1] }, // 0--hour // 1--day
    discount: { type: Number, default: 0 },
    fix: { type: Number, default: 0 },
    mswt: { type: Number, default: 0 },
    saveLater: { type: Boolean, default: false },
    total: { type: Number, default: 0 },

    // itemTotal: { type: Number, defaul: 0 },
    // Discount: { type: String, default: null },
    // Mswt: { type: String, default: null },
    // Total: { type: Number, defaul: 0 },
    // saveForLater: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true }
);

export const invoiceItemModel = mongoose.model('invoiceItem', invoiceItemSchema);