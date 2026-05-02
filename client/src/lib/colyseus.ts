import { Client } from "@colyseus/sdk";
import type { server } from "../../../server/src/app.config.js";
import { env } from "./env.js";
export const client = new Client<typeof server>(env.VITE_SERVER_URL);