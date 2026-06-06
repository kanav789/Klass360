const jwt = require('jsonwebtoken');

const signToken = (adminId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: adminId, role: 'admin' }, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret);
};

module.exports = { signToken, verifyToken };
