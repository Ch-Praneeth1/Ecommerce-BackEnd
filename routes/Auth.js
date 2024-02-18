const express = require('express');
const { createUser } = require('../controller/Auth');


const router = express.Router();
// /auth is already added in the baes path 
router.post('/',createUser)

exports.router = router;