const express = require('express');
const mongoose = require('mongoose');
const { createProduct } = require('./controller/Product');
const server = express();
const productsRouter = require('./routes/Products')
const categoriesRouter = require('./routes/Category')
const brandsRouter = require('./routes/Brands')
//middlewares
server.use(express.json());//helps to parse req.body
server.use('/products',productsRouter.router);
server.use('/categories',categoriesRouter.router);
server.use('/brands',brandsRouter.router);


main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce');
    console.log("DataBase Connected");
  }

server.get('/', (req,res) => {
    res.json({status:"success"})
})


server.listen(8080, ()=>{
    console.log("server started")
});