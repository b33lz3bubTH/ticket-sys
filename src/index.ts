import express from "express";
import cors from "cors";
import { TrainsController } from "./resources/trains/controllers";
import { TicketsController } from "./resources/tickets/controllers";

async function bootstrap() {
  console.log(`[+] starting...`);
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  // some default invites

  app.use('/api/v1', new TrainsController().getRouter());
  app.use('/api/v1', new TicketsController().getRouter());


  app.listen(4000, async () => {
    console.log(`[+] Listening on port 3000`);
  });
}

bootstrap().catch(err => {
  console.error(`[-] error: ${err}`);
})
