import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, default: null },
    image: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const categoryModel = mongoose.model('category', categorySchema);