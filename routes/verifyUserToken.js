const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization');
  console.log('user-tkn', token)

  if (!token) return res.status(401).json({ error: 'Access Denied' });

  jwt.verify(token, process.env.TOKEN_SECRET, (error, payload) => {
    if (error) return res.status(400).json({ error: true, messsage: 'Invalid token' });

    console.log(payload);
    if (payload.role !== 'USER') return res.status(400).json({ error: true, messsage: 'Invalid token role' });
    req.user = payload;
    next();
  });
}

module.exports = auth;