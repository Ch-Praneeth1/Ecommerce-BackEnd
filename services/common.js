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
    // token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZGEwMTllMzdiMjE2MDAwZDVmMjk3YyIsIm5hbWUiOiJQcmFuZWV0aCIsImVtYWlsIjoiY2hwcmFuZWV0aHZhcmRoYW5yZWRkeTE0M0BnbWFpbC5jb20iLCJhZGRyZXNzZXMiOltdLCJyb2xlIjoidXNlciIsImlhdCI6MTcwODc4NjA3OH0.7M1bNn2heg9-IUdbhq9xxeUxuHjjjFGLQzNG-SMWmDI"
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZDcyNmM4Mzk5MzZiZDMxMzNkYjZlNSIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiYWRkcmVzc2VzIjpbXSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA4NTk4OTg0fQ.-1OuU9wx3VELsfOmTjuruRQE2w4p3_VH69MU3MXFnpc"
    return token;
  };