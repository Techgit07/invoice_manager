import mongoose from "mongoose"

const supplierSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    supplierName: { type: String, default: null },
    mobile: { type: String, default: null },
    email: { type: Array, default: null, lowercase: true },

    //----BillingAddress 
    streetName: { type: String, default: null },
    additionalLine: { type: String, default: null },
    postCode: { type: String, default: null },
    City: { type: String, default: null },

    //----contactDetails
    country: { type: String, default: null },
    webSite: { type: String, default: null },
    payTerms: { type: Number, default: null, enum: [0, 1, 2, 3] }, // 0--custom, 1--45days, 2--30days, 3--15days
    Note: { type: String, default: null },
    // paid: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

export const supplierModel = mongoose.model("supplier", supplierSchema)