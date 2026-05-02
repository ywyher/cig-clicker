import { Client } from "@colyseus/sdk";
import type { server } from "../../../server/src/app.config.js";
export const client = new Client<typeof server>("http://localhost:2567");