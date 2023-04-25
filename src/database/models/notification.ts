import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    userIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }], default: [] },
    clickUsers: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }], default: [] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const notificationModel = mongoose.model('notification', notificationSchema)