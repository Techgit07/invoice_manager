import gcm from 'node-gcm'
import config from 'config'

const sender = new gcm.Sender(config.get('fcmKey'))
console.log("sender", sender);


export const notification_to_reminder = async (sender_user_data: any, data: any, notification: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (sender_user_data && data && notification && sender_user_data?.deviceToken?.length != 0 && sender_user_data != undefined && sender_user_data != null) {
                let message = new gcm.Message({
                    data: data,
                    notification: notification
                });
                sender.send(message, {
                    registrationTokens: sender_user_data?.deviceToken
                }, function (err, response) {
                    if (err) {
                        reject(err)
                    } else {
                        console.log("respone", response);
                        resolve(response)
                    }
                })
            }
            else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}

export const notification_to_user = async (sender_user_data: any, data: any, notification: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (sender_user_data && data && notification && sender_user_data?.deviceToken?.length != 0 && sender_user_data != undefined && sender_user_data != null) {
                let message = new gcm.Message({
                    data: data,
                    notification: notification
                });
                // console.log(sender_user_data?.deviceToken);
                sender.send(message, {
                    registrationTokens: sender_user_data?.deviceToken
                }, function (err, response) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(response)
                    }
                })
            }
            else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}