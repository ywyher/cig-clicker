import { Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";

export function createGameScene() {
  k.scene("game", (room: Room<RoomState>) => {
    setupScene(room)

    const game = k.add([
      k.text("game started", { size: 20 }),
      k.pos(k.center().x, k.height() - 60),
      k.anchor("center"),
      k.area(),
    ]);
  });
}