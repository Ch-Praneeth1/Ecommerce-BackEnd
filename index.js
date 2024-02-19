const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createProduct } = require('./controller/Product');
const server = express();
const productsRouter = require('./routes/Product')
const categoriesRouter = require('./routes/Category')
const brandsRouter = require('./routes/Brands')
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
//middlewares
server.use(cors());
server.use(express.json());//helps to parse req.body
server.use('/products',productsRouter.router);
server.use('/categories',categoriesRouter.router);
server.use('/brands',brandsRouter.router);
server.use('/users',usersRouter.router);
server.use('/auth',authRouter.router);

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