const express = require('express');
const { createProduct, fetchAllProducts } = require('../controller/Product');
const router = express.Router();



//    /products is already added in base path 
router.post('/',createProduct)
      .get('/',fetchAllProducts)
exports.router = router;