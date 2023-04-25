import { CronJob } from 'cron'
import { notification_types } from '../common'
import { draftInvoiceModel } from '../database'
import { preferences_mail } from './nodemailer'
// import { } from './nodemailer'
import { notification_to_reminder } from './notification'

// export const preferences_on_due_date__cron = new CronJob('30 * * * * *', async () => { // for check API
export const preferences_on_due_date__cron = new CronJob('0 0 * * *', async () => {
    try {
        console.log("000000000000000000000000000000000000000000000000")
        const todayDateStart = new Date()
        todayDateStart.setHours(0, 0, 0, 0)
        const todayDateEnd = new Date(new Date().setDate(todayDateStart.getDate() + 1))
        todayDateEnd.setHours(0, 0, 0, 0)

        let data = await draftInvoiceModel.aggregate([
            { $match: { dueDate: { $lte: todayDateEnd, $gte: todayDateStart }, isActive: true } },
            {
                $lookup: {
                    from: "invoiceitems",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$invoiceId", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "item"
                }
            },
            {
                $lookup: {
                    from: "customers",
                    let: { billTo: '$billTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$billTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "customer"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            }
        ])
        console.log("datataaaaa ---------", data[0]);

        for (let i = 0; i < data.length; i++) {
            let onDueDate_notification: any = await notification_types.onDueDate({ Total: data[i].Total, userName: data[i].user[0].name, data: data[i] })
            if (data[i].user[0].preferencesByMail == true && data[i].user[0].preferencesByNotifications == true && data[i].user[0].preferencesOnDueDate == true) {
                console.log("bouth");

                let mail = await preferences_mail({ invoice: data[i], customer: data[i].customer[0], user: data[i].user[0] });
                console.log("====mailingggggg", mail);
                let hello = await notification_to_reminder(data[i]?.user[0], onDueDate_notification?.template, onDueDate_notification?.data);
                console.log("====hellonotify", hello);

            }
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesOnDueDate == true) {
                console.log("maill");

                await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] })
                // console.log("mailllllldl;sdjmfdjmfdwnfdwbfu", mail);

            }
            if (data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesOnDueDate == true) {
                console.log("notifa");
                let notifi = await notification_to_reminder(data[i]?.user[0], onDueDate_notification?.data, onDueDate_notification?.template)
                console.log("mndklfhdfghdifgidufgdifnwdicghd -fdbjdfb", notifi);
            }
        }
    } catch (error) {
        console.log(error)
    }
})

export const preferences_three_day_before_due_date__cron = new CronJob('0 0 * * *', async () => {
    try {
        const todayDateStart = new Date()
        todayDateStart.setHours(0, 0, 0, 0)
        const todayDateEnd = new Date(new Date().setDate(todayDateStart.getDate() + 1))
        todayDateEnd.setHours(0, 0, 0, 0)

        let data: any = await draftInvoiceModel.aggregate([
            { $match: { threeDaysBefore: { $lte: todayDateEnd, $gte: todayDateStart }, isActive: true } },
            {
                $lookup: {
                    from: "invoiceitems",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$invoiceId", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "Item_Data"
                }
            },
            {
                $lookup: {
                    from: "customers",
                    let: { billTo: '$billTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$billTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        }, {
                            $project: { billingName: 1, _id: 0 }
                        }
                    ],
                    as: "customer"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            },
        ])
        for (let i = 0; i < data?.length; i++) {
            let threeDayBefore_notification: any = await notification_types.threeDateBefor({ Total: data[i].Total, userName: data[i].user[0].name, data: data[i] })
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesThreeDaysBefore == true) {/* mail and notifications send  */
                await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] })
                await notification_to_reminder(data[i]?.user[0], threeDayBefore_notification?.data, threeDayBefore_notification?.template)
            }
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesThreeDaysBefore == true) { await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] }) }
            if (data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesThreeDaysBefore == true) { await notification_to_reminder(data[i]?.user[0], threeDayBefore_notification?.data, threeDayBefore_notification?.template) }
        }
    } catch (error) {
        console.log(error)
    }
})

export const preferences_three_day_after_due_date__cron = new CronJob('0 0 * * *', async () => {
    try {
        const todayDateStart = new Date()
        todayDateStart.setHours(0, 0, 0, 0)
        const todayDateEnd = new Date(new Date().setDate(todayDateStart.getDate() + 1))
        todayDateEnd.setHours(0, 0, 0, 0)

        let data: any = await draftInvoiceModel.aggregate([
            { $match: { threeDaysAfter: { $lte: todayDateEnd, $gte: todayDateStart }, isActive: true } },
            {
                $lookup: {
                    from: "invoiceitems",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$invoiceId", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "Item_Data"
                }
            },
            {
                $lookup: {
                    from: "customers",
                    let: { billTo: '$billTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$billTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        }, {
                            $project: { billingName: 1, _id: 0 }
                        }
                    ],
                    as: "customer"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            },
        ])
        for (let i = 0; i < data?.length; i++) {
            let onDueDate_notification: any = await notification_types.threeDateAfter({ Total: data[i].Total, userName: data[i].user[0].name, data: data[i] })
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesThreeDaysAfter == true) {/* mail and notifications send  */
                await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] })
                await notification_to_reminder(data[i]?.user[0], onDueDate_notification?.data, onDueDate_notification?.template)
            }
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesThreeDaysAfter == true) {/* mail send  */    await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] }) }
            if (data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesThreeDaysAfter == true) { await notification_to_reminder(data[i]?.user[0], onDueDate_notification?.data, onDueDate_notification?.template) }
        }
    } catch (error) {
        console.log(error)
    }
})

export const preferences_seven_day_after_due_date__cron = new CronJob('0 0 * * *', async () => {
    try {
        const todayDateStart = new Date()
        todayDateStart.setHours(0, 0, 0, 0)
        const todayDateEnd = new Date(new Date().setDate(todayDateStart.getDate() + 1))
        todayDateEnd.setHours(0, 0, 0, 0)

        let data: any = await draftInvoiceModel.aggregate([
            { $match: { sevenDaysAfter: { $lte: todayDateEnd, $gte: todayDateStart }, isActive: true } },
            {
                $lookup: {
                    from: "invoiceitems",
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$invoiceId", "$$id"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "Item_Data"
                }
            },
            {
                $lookup: {
                    from: "customers",
                    let: { billTo: '$billTo' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$billTo"] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        }, {
                            $project: { billingName: 1, _id: 0 }
                        }
                    ],
                    as: "customer"
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$createdBy"] },
                                        { $eq: ["$isActive", true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            },

        ])
        for (let i = 0; i < data?.length; i++) {
            let onDueDate_notification: any = await notification_types.sevenDateAfter({ Total: data[i].Total, userName: data[i].user[0].name, data: data[i] })
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesSevenDaysAfter == true) {/* mail and notifications send  */
                await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] })
                await notification_to_reminder(data[i]?.user[0], onDueDate_notification?.data, onDueDate_notification?.template)
            }
            if (data[i]?.user[0].preferencesByMail == true && data[i]?.user[0].preferencesSevenDaysAfter == true) {/* mail send */   await preferences_mail({ invoice: data[i], customer: data[i]?.customer[0], user: data[i].user[0] }) }
            if (data[i]?.user[0].preferencesByNotifications == true && data[i]?.user[0].preferencesSevenDaysAfter == true) {
                await notification_to_reminder(data[i]?.user[0], onDueDate_notification?.data, onDueDate_notification?.template)
            }
        }
    } catch (error) {
        console.log(error)
    }
})