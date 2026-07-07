module.exports = {
  apps: [
    {
      name: 'marshal-bot',
      script: 'src/index.js',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: '300M',
    },
  ],
};
