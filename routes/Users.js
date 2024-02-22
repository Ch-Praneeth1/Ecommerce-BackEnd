const express = require('express');
const { fetchUserById, updateUser } = require('../controller/User');


const router = express.Router();
// /users is already added in the baes path 
router.get('/mine', fetchUserById)
        .patch('/:id', updateUser)


exports.router = router;