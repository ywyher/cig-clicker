import { Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";

export function createDashboardScene() {
  k.scene("dashboard", (room: Room<RoomState>) => {
    setupScene(room)

    let index = 0;
    room.state.players.forEach((player) => {
      k.add([
        k.text(`${player.name}: ${player.score}`, { size: 16 }),
        k.pos(40, 40 + index * 32),
      ]);
      index++;
    });

    k.add([
      k.text("dashboard", { size: 20 }),
      k.pos(k.center().x, k.height() - 60),
      k.anchor("center"),
      k.area(),
    ]);
  });
}