const passport = require('passport');

exports.isAuth = (req,res,done) => {
    return passport.authenticate('jwt');
};

exports.sanitizeUser = (user) => {
  return {id:user.id, name:user.name, email:user.email, addresses:user.addresses, role:user.role};
}

exports.cookieExtractor = function(req) {
    let token = null;
    if(req && req.cookies){
       token = req.cookies['jwt'];
    }
    return token;
  };