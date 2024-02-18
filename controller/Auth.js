const { User } = require("../model/User");

exports.createUser= async (req,res) => {
    const user = new User(req.body);
    try{
        const doc = await user.save();
        res.status(201).json(doc);
    }catch (err) {
        res.status(400).json(err);
    }
};