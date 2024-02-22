const { User } = require("../model/User");
const crypto = require('crypto');
const SECRET_KEY = 'SECRET_KEY';
const jwt = require('jsonwebtoken')
exports.createUser = async (req,res) => {
    try{
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword){
        const user = new User({...req.body,password:hashedPassword, salt});
        const doc = await user.save();
        req.login(doc,(err)=>{
            if(err){
                res.status(400).json(err);
            } else {
                const token = jwt.sign({id:user.id, name:user.name, email:user.email, addresses:user.addresses, role:user.role}, SECRET_KEY);
                res.cookie('jwt', token, { expires: new Date(Date.now() + 3600000), httpOnly: true }).status(201).json(token);
            }
        })
        
        })
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.loginUser = async (req,res) => {
    //DONE: We need a strong password authentication 
    res.cookie('jwt', req.user.token, { expires: new Date(Date.now() + 3600000), httpOnly: true }).status(201).json(req.user.token);
};

exports.checkUser = async (req,res) => {
    if(req.user){
        res.json(req.user);
    }else{
        res.sendStatus(200);
    }
}