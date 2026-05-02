import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {},

  clientPrefix: "VITE_",

  client: {
    VITE_SERVER_URL: z.string().min(1),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});