module.exports = {
  apps: [
    {
      name: 'journalfx-api',
      script: 'server.js',
      cwd: '/var/www/journalfx/backend',
      node_args: '--experimental-sqlite',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
