const express = require('express');
const mongoose = require('mongoose');
const server = express();

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    console.log("DataBase Connected");
  }

server.get('/', (req,res) => {
    res.json({status:"success"})
})

server.listen(8080, ()=>{
    console.log("server started")
});