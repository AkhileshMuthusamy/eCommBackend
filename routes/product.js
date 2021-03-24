const router = require('express').Router();
const verify = require('./verifyToken');
const productModel = require('../model/product');
const orderModel = require('../model/order');

// router.get('/', verify, (req, res) => {
//     res.json({
//         posts: {
//             title: 'my first post',
//             description: 'random data you shouldnt access'
//         }
//     });
// })

router.post('/', async(req, res) => {

    if (!req.body.name || !req.body.sellingPrice || !req.body.SKU) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    // Check if user SKU exists in the database
    const skuExist = await productModel.findOne({ SKU: req.body.SKU });
    if (skuExist) return res.status(400).json({error: true, message: 'SKU already exists'});

    let imgArray = [];

    console.log(!req.files.length)
    console.log(req.files.length)
    if (req.files.length > 0) {
        console.log('I am inside here');
        imgArray = req.files.map((file) => {
            encode_image = {
                filename: filename(file.originalname),
                contentType: file.mimetype,
                imageBase64: file.buffer.toString('base64')
            };
            return encode_image;
        });
    }
    
    
    const product = new productModel({
        name: req.body.name,
        SKU: req.body.SKU,
        sellingPrice: req.body.sellingPrice,
        description: req.body.description || '',
        dimension: req.body.dimension || 'N/A',
        weight: req.body.weight || 0,
        category: req.body.category || 'Others',
        manufacturer: req.body.manufacturer || '',
        images: imgArray
    });

    try {
        await product.save();
        res.status(200).json({data: product._id, error: false});
    } catch (err) {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while saving product'});
    }
})

router.get('/', async(req, res) => {
    try {
        console.log(req.query.s)
        if (!req.query.s && !req.query.id) {
            const products = await productModel.find();
            res.status(200).json({data: products.length > 0 ? products : [], error: false});
        } else if (req.query.id) {
            const products = await productModel.findById({_id: req.query.id});
            res.status(200).json({data: products, error: false});
        } else {
            const products = await productModel.find({'name': {'$regex': req.query.s, '$options': 'i'}});
            res.status(200).json({data: products.length > 0 ? products : [], error: false});
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading products'});
    }
})

router.get('/category/:id', async(req, res) => {
    try {
        if (req.params.id) {
            const products = await productModel.find({category: req.params.id});
            res.status(200).json({data: products.length > 0 ? products : [], error: false});
        } else {
            res.status(400).json({error: true, message: 'Missing Parameter'});
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading products'});
    }
})

router.put('/', (req, res) => {

    if (!req.body.SKU) {
        res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    productModel.findOneAndUpdate({SKU: req.body.SKU}, req.body, {upsert: false}).then(() => {
        res.status(200).json({error: false, message: 'Product updated successfully'});
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while updating product'});
    });
})

router.delete('/:SKU', (req, res) => {
    if (!req.params.SKU) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    try {
        productModel.deleteOne({ SKU: req.params.SKU }).then(() => {
            res.status(200).json({data: null, error: false});
        }).catch((err) => {
            console.log(err);
            res.status(400).json({error: true, message: 'Error while deleting product'});
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while deleting product'});
    }
})

router.get('/recent', (req, res) => {
    try {
        productModel.find().sort({ _id: -1 }).limit(10).then((record) => {
            res.status(200).json({data: record, error: false});
        }).catch((err) => {
            console.log(err);
            res.status(400).json({error: true, message: 'Error while fetching recent product'});
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while fetching recent product'});
    }
});

router.post('/review', async(req, res) => {
    try {
        if (req.body.productId) {
            await productModel.findByIdAndUpdate({_id: req.body.productId}, { $push: { reviews: req.body.productReviewData  } });
            const order = await orderModel.findOne({_id: req.body.orderId});
            const order_prd = order.products.filter(prd => {
                return prd._id === req.body.productId
            });
            order_prd[0].rating = req.body.orderReviewData.rating;
            order_prd[0].title = req.body.orderReviewData.title;
            order_prd[0].message = req.body.orderReviewData.message;
            const order_n = await orderModel.findByIdAndUpdate({_id: req.body.orderId}, {products: order.products});
            res.status(200).json({data: order_n, error: false});
        } else {
            res.status(400).json({error: true, message: 'Missing Parameter'});
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading products'});
    }
});

router.put('/review', async(req, res) => {
    try {
        if (req.body.productId) {
            const product = await productModel.findOne({_id: req.body.productId});
            const prd_review = product.reviews.filter(prd => {
                return prd.orderId === req.body.orderId
            });
            prd_review[0].rating = req.body.productReviewData.rating;
            prd_review[0].title = req.body.productReviewData.title;
            prd_review[0].message = req.body.productReviewData.message;
            prd_review[0].username = req.body.productReviewData.username;
            prd_review[0].reviewDate = Date.now
            
            const order = await orderModel.findOne({_id: req.body.orderId});
            const order_prd = order.products.filter(prd => {
                return prd._id === req.body.productId
            });
            order_prd[0].rating = req.body.orderReviewData.rating;
            order_prd[0].title = req.body.orderReviewData.title;
            order_prd[0].message = req.body.orderReviewData.message;
            const order_n = await orderModel.findByIdAndUpdate({_id: req.body.orderId}, {products: order.products});
            await productModel.findByIdAndUpdate({_id: req.body.productId}, { reviews: product.reviews });
            res.status(200).json({data: order_n, error: false});
        } else {
            res.status(400).json({error: true, message: 'Missing Parameter'});
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading products'});
    }
});

function filename(fileName) {
    let ext = fileName.substr(fileName.lastIndexOf('.'));
    return Date.now() + ext
}

module.exports = router;