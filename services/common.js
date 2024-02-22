const passport = require('passport');

exports.isAuth = (req,res,done) => {
    return passport.authenticate('jwt');
};

exports.sanitizeUser = (user) => {
  return {id:user.id, role:user.role};
}

exports.cookieExtractor = function(req) {
    var token = null;
    if(req && req.cookies){
       token = req.cookies['jwt'];
    }
    //TODO: this is temporary token for testing without cookie
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZDYzNWI5Y2JmOTk2MGUwNjI0OTAwYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA4NTk1MTM3fQ.-i90qzaEw3PP5J0RcvkM2Av-RUD-l7_zyOX4SbJ0MDc"
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZDcyNmM4Mzk5MzZiZDMxMzNkYjZlNSIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiYWRkcmVzc2VzIjpbXSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA4NTk4OTg0fQ.-1OuU9wx3VELsfOmTjuruRQE2w4p3_VH69MU3MXFnpc"
    return token;
  };