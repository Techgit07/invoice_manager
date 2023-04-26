import AWS from "aws-sdk"
import config from "config"

const aws: any = config.get("aws")
// console.log(aws);

AWS.config.update({
    region: aws.bucket_region,
    credentials: {
        accessKeyId: aws.access_key,
        secretAccessKey: aws.secret_key
    },
})

const sns = new AWS.SNS({ apiVersion: '2021-10-21' });
const SNS_TOPIC_ARN = aws.aws_arn

export const sendPDF = async (number: any, link: any) => {
    return new Promise(async (resolve, reject) => {
        let countryCode = "91"
        console.log("----num", number);
        console.log("----link", link);
        try {
            number = `+${countryCode} ${number}`
            console.log("------number", number);

            await sns.subscribe(
                {
                    Protocol: 'SMS',
                    TopicArn: SNS_TOPIC_ARN,
                    Endpoint: number,
                },
                async (error, data) => {
                    if (error) {
                        console.log('Error in subscribe');
                        console.log(error);
                    }
                    var params = {
                        Message: `your Invoice-Manager Link ${link}`,
                        PhoneNumber: number,
                        MessageAttributes: {
                            'AWS.SNS.SMS.SMSType': {
                                DataType: 'String',
                                StringValue: 'Transactional',
                            },
                            'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: 'Invoice-Manager' }
                        }
                    };
                    console.log("----params", params);

                    await sns.publish(params, (err_publish, data) => {
                        if (err_publish) {
                            console.log(err_publish);
                            reject(err_publish);
                        } else {
                            resolve(data);
                        }
                    });
                }
            );
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}
