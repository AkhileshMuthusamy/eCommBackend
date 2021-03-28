const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ error: true, role: 'ADMIN', messsage: 'Access Denied' });

  jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
    if (error) return res.status(401).json({ error: true, role: 'ADMIN', messsage: 'Token expired' });

    console.log(payload);
    if (payload.role !== 'ADMIN') return res.status(400).json({ error: true, role: 'ADMIN', messsage: 'Invalid token role' });
    req.user = payload;
    next();
  });
}

module.exports = auth;
