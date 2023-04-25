import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    supplierTo: { type: mongoose.Schema.Types.ObjectId, ref: "supplier" },
    category: { type: String, default: null },
    typeImage: { type: String, default: null },
    price: { type: Number, default: null },
    date: { type: Date, default: null },
    description: { type: String, default: null },
    image: { type: String, default: null },
    paid: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const expenseModel = mongoose.model('expense', expenseSchema);