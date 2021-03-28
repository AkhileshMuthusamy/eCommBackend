const router = require('express').Router();
const verify = require('./verifyToken');
const verifyAdmin = require('./verifyAdminToken');
const verifyUser = require('./verifyUserToken');
const orderModel = require('../model/order');
const mailer = require('../_modules/mailer');
var moment = require('moment');

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

router.put('/admin-cancel', verifyAdmin, (req, res) => {

    if (!req.body._id) {
        res.status(400).json({error: true, message: 'One or more required field missing' });
        return;
    }

    orderModel.findOneAndUpdate({_id: req.body._id}, {status: 'CANCELLED_BY_ADMIN'}, {upsert: false}).then((record) => {
        const emailTemplateData = { orderId: record._id, shipDate: moment().format('MMMM Do YYYY, h:mm:ss a') };
        const toAddress = record.email;
        const subject = `Order Cancelled | Order Id: ${record._id}`;
        const emailTemplate = './email/templates/cancel_order_admin.ejs';
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
        res.status(200).json({error: false, message: 'Order cancelled'});
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while cancelling order'});
    });
});

router.put('/user-cancel', verifyUser, (req, res) => {

    if (!req.body._id) {
        res.status(400).json({error: true, message: 'One or more required field missing' });
        return;
    }

    orderModel.findOneAndUpdate({_id: req.body._id}, {status: 'CANCELLED_BY_USER'}, {upsert: false}).then((record) => {
        const emailTemplateData = { orderId: record._id, shipDate: moment().format('MMMM Do YYYY, h:mm:ss a') };
        const toAddress = record.email;
        const subject = `Order Cancelled | Order Id: ${record._id}`;
        const emailTemplate = './email/templates/cancel_order.ejs';
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
        res.status(200).json({error: false, message: 'Order cancelled'});
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while cancelling order'});
    });
});

router.put('/ship-order', verifyAdmin, (req, res) => {

    if (!req.body._id) {
        res.status(400).json({error: true, message: 'One or more required field missing' });
        return;
    }

    orderModel.findOneAndUpdate({_id: req.body._id}, req.body.data, {upsert: false}).then((record) => {
        const emailTemplateData = { trackingNumber: req.body.data.trackingNumber, shipDate: moment(req.body.data.shipDate).format('MMMM Do YYYY, h:mm:ss a') };
        const toAddress = record.email;
        const subject = `Order Shipped | Order Id: ${record._id}`;
        const emailTemplate = './email/templates/ship_order.ejs';
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
        res.status(200).json({error: false, message: 'Order shipped'});
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while shipping order'});
    });
});

module.exports = router;