import buildServer from "./server.js";

start();

async function start() {
  const server = await buildServer();
  await server.listen({
    host: '0.0.0.0',
    port: 3000,
  });
  console.log("server running at 3000");
}
