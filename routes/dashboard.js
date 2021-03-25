const router = require('express').Router();
const verify = require('./verifyToken');
const productModel = require('../model/product');
const orderModel = require('../model/order');
const userModel = require('../model/user');

router.get('/', async(req, res) => {
    try {
        const userCount = await userModel.countDocuments({role: "USER"});
        const pendingOrderCount = await orderModel.countDocuments({status: "PENDING"});
        const productCount = await productModel.countDocuments({});
        data = {
            userCount: userCount,
            pendingOrderCount: pendingOrderCount,
            productCount: productCount
        }
        res.status(200).json({data: data, error: false});
    } catch(err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading dashboard'});
    }
});

module.exports = router;