const { authSecret, activeDirectory } = require("../.env");
const jwt = require("jwt-simple");
const ActiveDirectory = require("activedirectory");

module.exports = app => {
  const { existsOrError, notExistsOrError } = app.api.validation;
  const signin = async (req, res) => {
    const activeDirectorySettings = {
      url: 'ldap://sccp59.sccorinthians.com.br',
      baseDN: 'DC=sccorinthians,DC=com,DC=br',
      username: 'svc_autenticacao_ad',
      password: '@ut3nTIC#'
    };
    const ad = new ActiveDirectory(activeDirectorySettings);
    const user = {
      username: req.body.username,
      password: req.body.password,
      local: req.body.local,
      role: null
    };
    console.log('Login')
    try {
      existsOrError(user.username, "Informe seu usuário");
      existsOrError(user.password, "Informe sua senha");
      existsOrError(user.local, "Informe um local válido");

      const userExists = await verifyIfUserExists();
      existsOrError(userExists, "Dados de acesso inválidos"); // Usuário não encontrado

      if (await isMemberOf(activeDirectory.groups.gestao)) {
        user.role = "gestao";
      } else if (await isMemberOf(activeDirectory.groups.operacional)) {
        user.role = "operacional";
      } else if (await isMemberOf(activeDirectory.groups.seguranca)) {
        user.role = "seguranca";
      } else {
        throw "Sem permissão para acessar o sistema";
      }

      const auth = await authenticate();
      existsOrError(auth.email, "Dados de acesso inválidos");
      return res.json(auth);
    } catch (error) {
      return res.status(400).send(error);
    }

    // Verifica se o usuário exits no AD
    async function verifyIfUserExists() {
      const response = await new Promise((resolve, reject) => {
        ad.userExists(user.username, (error, exits) => {
          if (error) return reject(error);
          resolve(exits);
        });
      });
      return response;
    }

    // Verifica se o usuário faz parte de algum grupo para acessar o sistema
    async function isMemberOf(group) {
      const response = await new Promise((resolve, reject) => {
        ad.isUserMemberOf(user.username, group, (error, isMember) => {
          if (error) return reject(error);
          resolve(isMember);
        });
      });
      return response;
    }

    // Autentica o usuário
    async function authenticate() {
      const response = await new Promise((resolve, reject) => {
        ad.authenticate(
          `${user.username}@sccorinthians.com.br`,
          user.password,
          (error, auth) => {
            if (error) return reject("Dados de acesso inválidos");
            if (auth) {
              ad.findUser(user.username, function (error, userFromAd) {
                if (error) return reject(error);
                existsOrError(userFromAd, "Dados de acesso inválidos");
                const now = Math.floor(Date.now() / 1000);
                const payload = {
                  username: userFromAd.sAMAccountName,
                  name: userFromAd.displayName,
                  email: userFromAd.mail,
                  role: user.role,
                  local: user.local,
                  iat: now,
                  exp: now + 60 * 60 * 24 * 1
                };
                resolve(payload);
              });
            }
          }
        );
      });
      return {
        ...response,
        token: jwt.encode(response, authSecret)
      };
    }
  };

  const validateToken = (req, res) => {
    const userData = req.body || null;
    try {
      if (userData) {
        const token = jwt.decode(userData.token, authSecret);
        const tokenCode = userData.token;
        if (new Date(token.exp * 1000) > new Date()) {
          return res.json({
            ...token,
            token: tokenCode
          });
        }
      }
    } catch (e) {
      // problema com o token
    }
    return res.send(false);
  };

  return { signin, validateToken };
};
