const router = require('express').Router();
const categoryModel = require('../model/category');

router.post('/', async(req, res) => {

    console.log(req.body);
    
    const category = new categoryModel({
        category: req.body,
    });

    await categoryModel.deleteMany();

    try {
        await category.save();
        res.status(200).json({data: category._id, error: false});
    } catch (err) {
        res.status(400).json({error: true, message: 'Error while saving category'});
    }
})

router.get('/', async(req, res) => {
    try {
        const categories = await categoryModel.find();
        res.status(200).json({data: categories.length > 0 ? categories[0].category : [], error: false});
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading category'});
    }
})

module.exports = router;