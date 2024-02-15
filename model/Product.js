const mongoose = require('mongoose');
const {Schema} = mongoose;


const productSchema = new Schema({

});

exports.Product = mongoose.model('Product',productSchema);