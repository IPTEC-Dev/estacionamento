module.exports = middleware => {
  return (req, res, next) => {
    if (req.user.role === "seguranca" || req.user.role === "gestao") {
      middleware(req, res, next);
    } else {
      res.status(401).send("Este usuário não faz parte da segurança");
    }
  };
};
