import { MapSchema, Schema, type } from "@colyseus/schema";
import { Player } from "./player.js";
import { GamePhase } from "../../types/index.js";

export class RoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") adminId: string = "";
  @type("string") phase: GamePhase = "lobby";
}