const config = {
  apps: [
    {
      name: "secure-chat-app",
      script: "./dist/src/index.js",
      max_memory_restart: "300M",
      autorestart: true,
    },
  ],
};

module.exports = config;
