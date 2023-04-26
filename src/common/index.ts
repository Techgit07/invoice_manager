import { Types } from 'mongoose'
const ObjectId = Types.ObjectId

export const userStatus = {
    user: 0,
    admin: 1
}

export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error
    }
}

export const notification_types = {
    onDueDate: async (data: any) => {
        // console.log("data1234568909", data);

        return {
            template: {
                title: `please check your invoice of invoice number ${data.data.invoiceNo} is this invoice paid or unpaid`, body: ""
            },
            data: {
                type: 0, invoiceId: data.data._id
            }
        }
    },

    threeDateBefor: async (data: any) => {
        return {
            template: {
                title: `3 days left to pay this invoice number ${data.data.invoiceNo}`, body: ""
            },
            data: {
                type: 1, invoiceId: data.data._id
            }
        }
    },

    threeDateAfter: async (data: any) => {
        return {
            template: {
                title: `Our records show that we haven’t yet received payment of for Invoice ${data.data.invoiceNo} which is overdue by 3 days.`, body: ""
            },
            data: {
                type: 2, invoiceId: data.data._id
            }
        }
    },

    sevenDateAfter: async (data: any) => {
        return {
            template: {
                title: `Our records show that we haven’t yet received payment of for Invoice ${data.data.invoiceNo} which is overdue by 7 days.`, body: ""
            },
            data: {
                type: 1, invoiceId: data.data._id
            }
        }
    },

    customer: async (data: any) => {
        return {
            template: {
                title: `Invoice Receipt`, body: `Thank you for your payment of ${data.invoice.Total}. This receipt confirms that the invoice ${data.invoice.invoiceNo}, Dated ${data.invoice.dueDate.toLocaleDateString()}, has been fully paid.`
            },
            data: {
                type: 3, invoiceId: data.data._id
            }
        }
    },

    admin_custom_notification: async (data: any) => {
        return {
            template: {
                title: `${data?.title}`, body: `${data?.description}`
            },
            data: {
                type: 1, notificationId: data?.notificationId, click_action: "INVOICE_NOTIFICATION_CLICK",
            }
        }
    },
}

export const stringToObjectIdConvert = async (items) => {
    return new Promise(async (resolve, reject) => {
        try {
            items = items.map(data => new ObjectId(data))
            resolve(items)
        } catch (error) {
            reject(error)
        }
    })
}



