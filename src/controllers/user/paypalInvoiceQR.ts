import axios from 'axios';
import { Request, Response } from "express";
import fs from 'fs'
const qr = require('qrcode')

export const paypal_qrcode_generate = async (req: Request, res: Response) => {

    let accessToken = 'A21AAIiVm9isfgTK8sJKgrafd5Rdjti93LHagPDUmREPRfuedff2a0H2cL1R4wHQF36wI_fl4cp7rURiaSl-9a5kb2V6xilxQ'
    let invoicer_email = 'sb-zfvz422348470@business.example.com'
    invoicer_email = 'sb-pq9ha20577484@business.example.com'


    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
        // 'Authorization': `Bearer ${accessToken}` 
    };

    axios.post('https://api-m.sandbox.paypal.com/v2/invoicing/generate-next-invoice-number', {}, { headers })
        .then(response => {
            console.log(response.data);
            let invoice_number = response.data.invoice_number


            // axios.post('https://api-m.sandbox.paypal.com/v2/invoicing/invoices', body, { headers }).then(res => {
            //     console.log(res.data);

            // }).catch(error => {

            //     console.error(error.response.data);
            // })
            axios({
                method: 'get',
                url: 'https://api.sandbox.paypal.com/v1/invoicing/templates',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer  ${accessToken}`
                }
            }).then((response) => {
                console.log(response.data.templates[0].template_id);
                let template_id = response.data.templates[0].template_id;
                const apiUrl = 'https://api-m.sandbox.paypal.com/v2/invoicing/invoices';

                const requestBody = {
                    "detail": {
                        "invoice_number": invoice_number,
                        "reference": "deal-ref",
                        "invoice_date": "2018-11-12",
                        "currency_code": "USD",
                        "note": "Thank you for your business.",
                        "term": "No refunds after 30 days.",
                        "memo": "This is a long contract",
                        "payment_term": {
                            "term_type": "NET_10",
                            "due_date": "2018-11-22"
                        }
                    },
                    "invoicer": {
                        "name": {
                            "given_name": "David",
                            "surname": "Larusso"
                        },
                        "address": {
                            "address_line_1": "1234 First Street",
                            "address_line_2": "337673 Hillside Court",
                            "admin_area_2": "Anytown",
                            "admin_area_1": "CA",
                            "postal_code": "98765",
                            "country_code": "US"
                        },
                        "email_address": invoicer_email,
                        "phones": [
                            {
                                "country_code": "001",
                                "national_number": "4085551234",
                                "phone_type": "MOBILE"
                            }
                        ],
                        "website": "www.test.com",
                        "tax_id": "ABcNkWSfb5ICTt73nD3QON1fnnpgNKBy- Jb5SeuGj185MNNw6g",
                        "logo_url": "https://example.com/logo.PNG",
                        "additional_notes": "2-4"
                    },
                    "primary_recipients": [
                        {
                            "billing_info": {
                                "name": {
                                    "given_name": "Stephanie",
                                    "surname": "Meyers"
                                },
                                "address": {
                                    "address_line_1": "1234 Main Street",
                                    "admin_area_2": "Anytown",
                                    "admin_area_1": "CA",
                                    "postal_code": "98765",
                                    "country_code": "US"
                                },
                                "email_address": "tubeviewb@gmail.com",
                                "phones": [
                                    {
                                        "country_code": "001",
                                        "national_number": "4884551234",
                                        "phone_type": "HOME"
                                    }
                                ],
                                "additional_info_value": "add-info"
                            },
                            "shipping_info": {
                                "name": {
                                    "given_name": "Stephanie",
                                    "surname": "Meyers"
                                },
                                "address": {
                                    "address_line_1": "1234 Main Street",
                                    "admin_area_2": "Anytown",
                                    "admin_area_1": "CA",
                                    "postal_code": "98765",
                                    "country_code": "US"
                                }
                            }
                        }
                    ],
                    "items": [
                        {
                            "name": "Yoga Mat",
                            "description": "Elastic mat to practice yoga.",
                            "quantity": "1",
                            "unit_amount": {
                                "currency_code": "USD",
                                "value": "50.00"
                            },
                            "tax": {
                                "name": "Sales Tax",
                                "percent": "7.25"
                            },
                            "discount": {
                                "percent": "5"
                            },
                            "unit_of_measure": "QUANTITY"
                        },
                        {
                            "name": "Yoga t-shirt",
                            "quantity": "1",
                            "unit_amount": {
                                "currency_code": "USD",
                                "value": "10.00"
                            },
                            "tax": {
                                "name": "Sales Tax",
                                "percent": "7.25"
                            },
                            "discount": {
                                "amount": {
                                    "currency_code": "USD",
                                    "value": "5.00"
                                }
                            },
                            "unit_of_measure": "QUANTITY"
                        }
                    ],
                    "configuration": {
                        "partial_payment": {
                            "allow_partial_payment": true,
                            "minimum_amount_due": {
                                "currency_code": "USD",
                                "value": "20.00"
                            }
                        },
                        "allow_tip": true,
                        "tax_calculated_after_discount": true,
                        "tax_inclusive": false,
                        "template_id": template_id
                    },
                    "amount": {
                        "breakdown": {
                            "custom": {
                                "label": "Packing Charges",
                                "amount": {
                                    "currency_code": "USD",
                                    "value": "10.00"
                                }
                            },
                            "shipping": {
                                "amount": {
                                    "currency_code": "USD",
                                    "value": "10.00"
                                },
                                "tax": {
                                    "name": "Sales Tax",
                                    "percent": "7.25"
                                }
                            },
                            "discount": {
                                "invoice_discount": {
                                    "percent": "5"
                                }
                            }
                        }
                    }

                };

                axios.post(apiUrl, requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'Prefer': 'return=representation'
                    }
                }).then((response) => {
                    console.log(response.data.id);

                    let invoice_id = response.data.id

                    const uuid = require('uuid');

                    const requestId = uuid.v4();


                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    };

                    const data = {
                        width: 400,
                        height: 400,
                        "action": "pay"
                    };

                    axios.post(`https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoice_id}/generate-qr-code`, data, config)
                        .then(response => {
                            // console.log(response.data);
                            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                            fs.writeFileSync('qrcode.txt', base64Image);
                            // console.log(base64Image);

                            console.log('QR code generated and saved to qrcode.txt');
                            fs.readFile('qrcode.txt', 'utf8', (err, data) => {
                                if (err) throw err;

                                // Generate QR code
                                qr.toFile('qrcode.png', data, {
                                    margin: 1,
                                    scale: 10,
                                }, (err) => {
                                    if (err) throw err;
                                    else {

                                        console.log('QR code generated!');
                                        const qrCodeImage = fs.readFileSync('qrcode.png');
                                        const qrCodeImageData = qrCodeImage.toString('base64');


                                        axios.get(`https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoice_id}`, {
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${accessToken}`
                                            }
                                        }
                                        ).then(response => {
                                            console.log("get api");


                                            let metadata2 = [
                                                {
                                                    "type": "QRCODE",
                                                    "url": "qrcode.png"
                                                }
                                            ]


                                            console.log(response.data);

                                            response.data.detail.metadata.images = metadata2
                                            data = response.data

                                            axios.put(

                                                `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoice_id}`,
                                                data,
                                                {
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Authorization": `Bearer ${accessToken}`
                                                    }
                                                }

                                            ).then(response => {
                                                console.log("put method");

                                                console.log(response.data);
                                                const invoiceId = invoice_id;

                                                const requestId = 'b1d1f06c7246c';

                                                const config = {
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${accessToken}`,
                                                        'PayPal-Request-Id': requestId,
                                                    },
                                                };

                                                const data = {
                                                    send_to_invoicer: true,
                                                };

                                                axios.post(`https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoiceId}/send`, data, config)
                                                    .then(response => {
                                                        console.log(response.data);
                                                        res.json(response.data)
                                                    })
                                                    .catch(error => {
                                                        console.log("+++++++++++++++++++");

                                                        console.log(error);
                                                    });
                                                // res.json(response.data)

                                                // const headers = {
                                                //     'Content-Type': 'application/json',
                                                //     'Authorization': `Bearer ${accessToken}` ,
                                                //     // 'PayPal-Request-Id': paypalRequestId
                                                // };

                                                // axios.post(`https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoice_id}/send`, data, { headers })
                                                //     .then(response => {


                                                //         console.log('Response:', response.data.links);
                                                //     }).catch(err => { console.log(err) });
                                            }).catch(
                                                error => {
                                                    console.error(error);
                                                }
                                            )
                                        }).catch(error => {
                                            console.error(error);
                                        });
                                    }
                                });
                            });
                            // qr.toDataURL(base64Image, { width: 300, margin: 2 }, async function (err, url) {
                            //     if (err) {
                            //         console.log("error while generating qrcode");
                            //         console.log(err);

                            //     }
                            //     else {

                            // console.log(url);



                            // Update the invoice with the new QR code


                            // Make a PUT request to update the invoice
                            //     const updateResponse = await axios({
                            //         method: 'put',
                            //         url: `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoiceId}`,
                            //         headers: {
                            //             'Content-Type': 'application/json',
                            //             'Authorization': `Bearer ${accessToken}` 
                            //         },
                            //         data: response.data
                            //     });

                            //     console.log('Invoice updated successfully:', updateResponse.data);


                            //     const headers = {
                            //         'Content-Type': 'application/json',
                            //         'Authorization': `Bearer ${accessToken}`,
                            //         'PayPal-Request-Id': paypalRequestId
                            //     };

                            //     axios.post(`https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${invoiceId}/send`, {}, { headers })
                            //         .then(response => {
                            //             console.log('Response:', response.data);
                            //         }).catch(err => { console.log(err) });

                            // } catch (error) {
                            //     console.error('Error updating invoice:', error.response.data);
                            // }


                            // }})
                            // })


                        })
                        .catch(error => {
                            console.error(error);
                        });
                })
                    .catch(error => {
                        console.error('Error:', error.response.data);
                    });



                // }).catch((error) => {
                //     console.error(error.response.data);
                // });
            }).catch((error) => {
                console.error(error);
            });
        })
        .catch(error => {
            console.error(error.response.data);
        });
}