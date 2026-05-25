module.exports = {
  apps: [
    {
      name: "aesthetx.ways",
      script: "npm",
      args: "start",
      cwd: "/home/aesthetx.ways",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 4000, // <--- new port
      },
    },
  ],
};
