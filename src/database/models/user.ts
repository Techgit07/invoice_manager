import mongoose from 'mongoose';

const userSchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    email: { type: String, default: null, lowercase: true },
    password: { type: String, default: null },
    userType: { type: Number, default: 0, enum: [0, 1] }, // 0-user // 1- admin
    otp: { type: String, default: null },
    otpExpireTime: { type: String, default: null },
    deviceToken: { type: [{ type: String }], default: [] },
    balance: { type: Number, default: 0, },
    facebookId: { type: String, default: null },

    //----Business Detail----
    accountId: { type: String, default: null },
    businessName: { type: String, default: null },
    streetName: { type: String, default: null },
    postCode: { type: String, default: null },
    city: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    url: { type: String, default: null },

    //----Tax Information----
    currency: { type: Number, default: 0 }, //---0_Euro, ---1_USD, ---2_Pound
    ust_Idnr: { type: String, default: null },
    steuer_Idnr: { type: String, default: null },
    amtsgericht: { type: String, default: null },
    handlesRegister: { type: String, default: null },
    // yourExpense: { type: String, default: null },
    // youWillGet: { type: String, default: null },
    // youGot: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    taxYear: { type: Date, default: null },
    tax: { type: Number, default: 0, enum: [0, 1, 2] }, //---0_0% //---1_7% //---2_19%

    //----Paypal----
    userName: { type: String, default: null },
    country: { type: String, default: null },
    terms: { type: Number, default: 0 }, // --0_sameday 1_7days 2_14days 3_21days 4_30days 5_45days 6_60days 7_90days
    paymentIntro: { type: String, default: null },

    // ----Settings----
    logourl: { type: String, default: null },
    color: { type: String, default: null },
    paymentReciept: { type: Boolean, default: false },
    preferencesByMail: { type: Boolean, default: false },
    preferencesByNotifications: { type: Boolean, default: false },
    preferencesOnDueDate: { type: Boolean, default: false },
    preferencesThreeDaysBefore: { type: Boolean, default: false },
    preferencesThreeDaysAfter: { type: Boolean, default: false },
    preferencesSevenDaysAfter: { type: Boolean, default: false },
    paypalAccessToken: { type: String, default: null },
    paypalRefreshToken: { type: String, default: null },
}, { timestamps: true })

export const userModel = mongoose.model('user', userSchema);