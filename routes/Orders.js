const express = require('express');
const { createOrder, fetchAllOrders, fetchOrdersByUser, deleteOrder, updateOrder } = require('../controller/Order');

const router = express.Router();

router.post('/',createOrder)
        .get('/',fetchAllOrders)
        .get('/:id',fetchOrdersByUser)
        .delete('/:id',deleteOrder)
        .patch('/:id',updateOrder)

exports.router = router