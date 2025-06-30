export const requestLogger = (req, res, next) => {
  const user = req.user ? `${req.user.id} (${req.user.role})` : 'guest';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - User: ${user}`);
  next();
}; 