import { Schema, type } from "@colyseus/schema";
import { SchemaFields } from "../../types/index.js";

export class Player extends Schema {
  @type("string") public name: string = "";
  @type("number") public score: number = 0;
  @type("number") public level: number = 1;
  @type("boolean") public connected: boolean = true;
}

export type PlayerType = SchemaFields<Player>;