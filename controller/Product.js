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
};

exports.fetchAllProducts = async (req,res) => {
    // Here we need all query string
    // filter = {"category":["smartphone","laptops"]}
    // sort = {_sort:"price",_order="desc"}
    let query = Product.find({});
    
    if(req.query.category){
        query = query.find({category: req.query.category});
    }

    if(req.query.brand){
        query = query.find({brand: req.query.brand});
    }
    //TODO: Need to get sort on discounted price not on actual price
    if(req.query._sort && req.query._order){
        query = query.sort({[req.query._sort]:req.query._order})         //{"title":"desc"}
    }


    try{
        const doc = await query.exec();
        res.status(201).json(doc);
    }catch (err) {
        res.status(400).json(err);
    }
};

exports.fetchProductById = async (req,res) => {
    const {id} = req.params;
    try{
        const product = await Product.findById(id);
        res.status(200).json(product);
    }catch (err) {
        res.status(400).json(err);
    }
};

exports.updateProduct = async (req,res) => {
    const {id} = req.params;
    try{
        const product = await Product.findByIdAndUpdate(id,req.body, {new:true});
        res.status(200).json(product);
    }catch (err) {
        res.status(400).json(err);
    }
};