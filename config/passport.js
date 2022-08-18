const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Keys = require('./keys');

module.exports = (passport) =>{
    let opts = {};  // Se usa let ya que va a cambiar el objeto.
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = Keys.secretOrKey;

    passport.use(new JwtStrategy(opts, (jwt_payload, done)=> {
        User.findById(jwt_payload.id, (err, user)=>{
            if (err){
                return done(err,false);
            }
            if(user){
                return done(null, user);
            }else{
                return done(null, false);
            }
        });
    }));
}

