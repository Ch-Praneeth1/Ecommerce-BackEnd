const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

const server = express();
const productsRouter = require('./routes/Product')
const categoriesRouter = require('./routes/Category')
const brandsRouter = require('./routes/Brands')
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Orders');
const { User } = require('./model/User');


//middlewares
server.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    
  }));
server.use(passport.authenticate('session'));
server.use(cors());
server.use(express.json());//helps to parse req.body
server.use('/products',isAuth, productsRouter.router);
server.use('/categories',categoriesRouter.router);
server.use('/brands',brandsRouter.router);
server.use('/users',usersRouter.router);
server.use('/auth',authRouter.router);
server.use('/cart',cartRouter.router);
server.use('/orders',ordersRouter.router);

// Passport Strategies
passport.use(new LocalStrategy( async function(username, password, done) {
        try{
            const user = await User.findOne({email:username}).exec();
            if(!user){
                done(null, false, {message: 'invalid credentials'})
            }
            crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function(err, hashedPassword){
                //TODO: this is just temporary, we will use JWT
                if (!crypto.timingSafeEqual(user.password, hashedPassword)){
                    return done(null, false, {message: 'invalid credentials'});                
                } else {
                    done(null, {id:user.id, name:user.name, email:user.email, addresses:user.addresses, role:user.role});

                }
            })
        }catch (err) {
            done(err);
        }
    }
));

// This creates a session variable req.user on being called from callbacks
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {id:user.id, role:user.role});
    });
  });
// This changes a session variable req.user when called from  autheorised request
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce');
    console.log("DataBase Connected");
  }

server.get('/', (req,res) => {
    res.json({status:"success"})
})

function isAuth(req,res,done){
    if(req.user){
        done()
    }else{
        res.send(401)
    }
}
server.listen(8080, ()=>{
    console.log("server started")
});