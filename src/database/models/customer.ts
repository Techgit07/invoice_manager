import mongoose from "mongoose"

const customerSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    billingName: { type: String, default: null },
    mobile: { type: String, default: null },
    email: { type: Array, default: null, lowercase: true },

    //----billingAddress 
    streetName: { type: String, default: null },
    additionalLine: { type: String, default: null },
    postCode: { type: String, default: null },
    City: { type: String, default: null },

    //----contactDetails
    country: { type: String, default: null },
    webSite: { type: String, default: null },
    payTerms: { type: Number, default: null, enum: [0, 1, 2, 3] }, // 0--custom, 1--45days, 2--30days, 3--15days
    Note: { type: String, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

export const customerModel = mongoose.model("customer", customerSchema)