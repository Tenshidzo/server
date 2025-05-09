import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  console.log('authMiddleware checking headers:', req.headers.authorization);

  if (!req.headers.authorization?.startsWith('Bearer ')) {
    console.log('No token found');
    return res.status(401).json({ error: 'Немає токена' });
  }

  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    console.log('authMiddleware passed, userId =', req.userId);
    return next();
  } catch (err) {
    console.log('authMiddleware JWT error:', err.message);
    return res.status(401).json({ error: 'Недійсний токен' });
  }
};

export default authMiddleware;
