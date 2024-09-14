import figlet from "figlet";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import { startIOserver } from "./startIOserver";
import cors from "cors";
dotenv.config();

const startup = async (): Promise<void> => {
  await new Promise((resolve) => {
    figlet("Secure Chat App", (_, data) => {
      console.log("\x1b[1m\x1b[32m%s\x1b[0m", data);
      resolve(true);
    });

    const app = express();
    const server = http.createServer(app);
    const { PORT } = process.env;

    startIOserver(server);

    app.use(
      cors({
        origin: "*",
      })
    );

    const port = PORT || 4531;

    server.listen(port, () => {
      console.log("Server is running on port " + port);
    });
  });
};

startup().catch((error: Error | any) => {
  throw error;
});
