const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
  app.use(
    ['/api'], //, '/auth/github', '/auth/facebook'],
    createProxyMiddleware({
      target: 'http://localhost:5678',
    })
  );
};
