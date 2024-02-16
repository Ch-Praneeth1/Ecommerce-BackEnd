const { Product } = require("../model/Product")

exports.createProduct = (req,res) => {
    // We should get the product from the api 
    const product = new Product(req.body);
    product.save().then((err,doc) => {
        console.log({err,doc});
        if(err){
            res.status(400).json(err);
        }else{
            res.status(201).json(doc);
        }
    })
}