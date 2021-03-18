const router = require('express').Router();
const categoryModel = require('../model/category');

router.post('/', (req, res) => {

    console.log(req.body);
    if (!req.body.name || !req.body.parent_id) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }
    
    const category = new categoryModel({
        name: req.body.name,
        parent_id: req.body.parent_id,
        child: req.body.child,
    });


    category.save().then(() => {
        res.status(200).json({data: category, error: false});
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while saving category'});
    });
})

router.get('/', async(req, res) => {
    try {
        const categories = await categoryModel.find();
        res.status(200).json({data: categories, error: false});
    } catch (err) {
        console.log(err)
        res.status(400).json({error: true, message: 'Error while loading category'});
    }
});

router.put('/', (req, res) => {
    if (!req.body._id || !req.body.data) {
        res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    categoryModel.findByIdAndUpdate({_id: req.body._id}, req.body.data).then(() => {
        res.status(200).json({error: false, message: 'Category updated successfully'});
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while updating category'});
    });
});

router.delete('/', (req, res) => {
    if (!req.body._id) {
        res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    categoryModel.findById({_id: req.body._id}).then(record => {
        if (record.child.length == 0) {
            categoryModel.findByIdAndDelete({_id: req.body._id}).then(() => {
                res.status(200).json({error: false, message: 'Category deleted successfully'});
            }).catch((err) => {
                console.log(err);
                res.status(400).json({error: true, message: 'Error while deleting category'});
            })
        } else {
            res.status(400).json({error: true, message: 'Unable to delete. Category has child category.'});
        }
    }).catch((err) => {
        console.log(err);
        res.status(400).json({error: true, message: 'Error while deleting category'});
    })
});

module.exports = router;