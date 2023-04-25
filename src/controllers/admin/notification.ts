import { Request, Response } from "express"
import { apiResponse, notification_types, stringToObjectIdConvert } from "../../common";
import { notificationModel, userModel, } from "../../database";
import { notification_to_user, responseMessage } from "../../helper"

export const sent_selected_user_notification = async (req: Request, res: Response) => {
    let { title, description, userIds, isAllUser } = req.body, user
    try {
        if (isAllUser) {
            user = await userModel.aggregate([
                { $match: { isActive: true, userType: 0 } },
                {
                    $group: {
                        _id: null,
                        deviceToken: { $addToSet: "$deviceToken" },
                        userIds: { $addToSet: "$_id" },
                    }
                }
            ])
        } else {
            userIds = await stringToObjectIdConvert(userIds)
            user = await userModel.aggregate([
                { $match: { _id: { $in: userIds }, isActive: true } },
                {
                    $group: {
                        _id: null,
                        deviceToken: { $addToSet: "$deviceToken" },
                        userIds: { $addToSet: "$_id" },
                    }
                }
            ])
        }
        let response = await new notificationModel({
            title, description, userIds: user[0]?.userIds
        }).save()
        let notification: any = await notification_types.admin_custom_notification({ title, description, notificationId: response?._id })
        await notification_to_user({ deviceToken: await user[0]?.deviceToken.flat(Infinity).filter(x => x) || [] }, notification?.data, notification?.template)
        return res.status(200).json(new apiResponse(200, responseMessage.customMessage("Notification has been successfully sent!"), {}, {}))
    } catch (error) {
        console.log('error', error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}