require('dotenv').config()
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
const { Order } = require('./model/Order');

// Webhook 
//TODO: we will capture actual order after deploying out server live on public URL
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      //console.log({paymentIntentSucceeded})
      const order = await Order.findById(paymentIntentSucceeded.metadata.orderId)
      order.paymentStatus = 'received'
      await order.save()
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});




// JWT option 

var opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;

//middlewares
server.use(express.static(path.resolve(__dirname, 'build')));
server.use(cookieParser());
server.use(session({
    secret: process.env.SESSION_KEY,
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
// react routes will work in case of other routes dosent match 
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

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
                    const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
                    done(null,{id:user.id, role:user.role, token});

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
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId} = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100,
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    metadata:{
      orderId
      //this info will go to stripe => and then to our webhook
      // soo we can conclude that payment was successful, wevn if client closes window after payment
    }
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});





main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DataBase Connected");
  }

server.listen(process.env.PORT, ()=>{
    console.log("server started")
});