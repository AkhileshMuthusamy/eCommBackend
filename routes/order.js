const router = require('express').Router();
const verify = require('./verifyToken');
const orderModel = require('../model/order');
const mailer = require('../_modules/mailer');

router.get('/', (req, res) => {
    try {
        console.log(req.query.email)
        if (!req.query.email) {
            orderModel.find().then((record) => {
                res.status(200).json({data: record, error: false});
            }).catch((err) => {
                console.log(err);
                res.status(400).json({error: true, message: 'Error while fetching order'});
            });
        } else {
            orderModel.find({ email: req.query.email }).then((record) => {
                res.status(200).json({data: record, error: false});
            }).catch((err) => {
                console.log(err);
                res.status(400).json({error: true, message: 'Error while fetching order'});
            });
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading order'});
    }
});

router.post('/', (req, res) => {

    if (!req.body.products || !req.body.totalAmount || !req.body.email || !req.body.payment) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    const order = new orderModel({
        products: req.body.products,
        totalAmount: req.body.totalAmount,
        email: req.body.email,
        payment: req.body.payment,
        shippingAddress: req.body.shippingAddress
    });

    try {
        order.save().then((record) => {
            const emailTemplateData = { orderId: record._id, orderDate: record.orderDate };
            const toAddress = record.email;
            const subject = `Order Received | Order Id: ${record._id}`;
            const emailTemplate = './email/templates/new_order.ejs';
            isEmailSuccess = false;
            mailer
                .sendHtmlEmail(toAddress, subject, emailTemplate, emailTemplateData)
                .then(info => {
                    console.log('Message sent: %s', info.messageId);
                    isEmailSuccess = true;
                })
                .catch(err => {
                    console.log(err);
                    isEmailSuccess = false;
                });
            res.status(200).json({data: record, error: false});
        }).catch((err) => {
            console.log(err);
            res.status(400).json({error: true, message: 'Error while fetching order'});
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading order'});
    }
});

module.exports = router;