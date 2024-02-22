const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const server = express();
const productsRouter = require('./routes/Product')
const categoriesRouter = require('./routes/Category')
const brandsRouter = require('./routes/Brands')
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Orders');
const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require('path');
const { toASCII } = require('punycode');


// JWT option 

const SECRET_KEY = 'SECRET_KEY';
var opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;

//middlewares
server.use(express.static(path.resolve(__dirname, 'build')));
server.use(cookieParser());
server.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    
  }));
server.use(passport.authenticate('session'));
server.use(cors());
server.use(express.json());//helps to parse req.body
server.use('/products',isAuth(), productsRouter.router);
server.use('/categories',isAuth(), categoriesRouter.router);
server.use('/brands',isAuth(), brandsRouter.router);
server.use('/users',isAuth(), usersRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart',isAuth(), cartRouter.router);
server.use('/orders',isAuth(), ordersRouter.router);

// Passport Strategies
passport.use('local', new LocalStrategy({usernameField
:'email'}, async function(email, password, done) {
        try{
            const user = await User.findOne({email:email});
            if(!user){
                done(null, false, {message: 'invalid credentials'})
            }
            crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function(err, hashedPassword){
                //TODO: this is just temporary, we will use JWT
                if (!crypto.timingSafeEqual(user.password, hashedPassword)){
                    return done(null, false, {message: 'invalid credentials'});                
                } else {
                    const token = jwt.sign(sanitizeUser(user), SECRET_KEY);
                    done(null,{id:user.id, role:user.role});

                }
            })
        }catch (err) {
            done(err);
        }
    }
));

passport.use('jwt', new JwtStrategy(opts, async function(jwt_payload, done) {
 
  try{
        const user = await User.findById(jwt_payload.id);
        
        if (user) {
            return done(null, sanitizeUser(user));
        } else {
            return done(null, false);
            // or you could create a new account
        }
    } catch (err) {
        return done(err, false);
    }
}));

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


// Payments 

// This is your test secret API key.
const stripe = require("stripe")('sk_test_51OmaVLSID4lPrQkV1n1CPlA0eTxzu7TMMTCsF5V2eIejbTLSQzle3B2Ah52FSDPo6Au4m6vn8duPt7F5jvjQEIiB00H9TZe3bG');

const calculateOrderAmount = (totalAmount) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return totalAmount*100;   // must be sent in pisa
};

server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(totalAmount),
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
   
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});





main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Ecommerce');
    console.log("DataBase Connected");
  }

server.listen(8080, ()=>{
    console.log("server started")
});