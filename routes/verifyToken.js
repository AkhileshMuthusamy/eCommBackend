const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('auth-token');

  if (!token) return res.status(401).json({ error: 'Access Denied' });

  jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
    if (error) return res.status(400).json({ error: 'Invalid token', messsage: error.messsage });

    console.log(payload);
    req.user = payload;
    next();
  });
}

module.exports = auth;
