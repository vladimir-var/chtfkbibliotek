const { env } = require('process');

// Определяем целевой сервер, исходя из переменных окружения
const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7278';

const PROXY_CONFIG = [
  {
    // Проксируем все запросы, начинающиеся с /api
    context: [
      "/api",
    ],
    target,
    secure: false,
    changeOrigin: true // Для того, чтобы сервер корректно обрабатывал проксируемые запросы
  }
]

module.exports = PROXY_CONFIG;
