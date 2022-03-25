const { authSecret, activeDirectory } = require("../.env");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const { Strategy, ExtractJwt } = passportJwt;
const ActiveDirectory = require("activedirectory");

module.exports = app => {
  const params = {
    secretOrKey: authSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  };

  const strategy = new Strategy(params, (payload, done) => {
    const ad = new ActiveDirectory({
      url: 'ldap://sccp59.sccorinthians.com.br',
      baseDN: 'DC=sccorinthians,DC=com,DC=br',
      username: 'svc_autenticacao_ad',
      password: '@ut3nTIC#'
    });
    ad.findUser(payload.username, function(err, user) {
      if (err) {
        done(err, false);
      }
      if (!user) {
        done("Usuário não encontrado", false);
      } else {
        done(null, user ? { ...payload } : false);
      }
    });
  });

  passport.use(strategy);

  return {
    authenticate: () => passport.authenticate("jwt", { session: false })
  };
};
