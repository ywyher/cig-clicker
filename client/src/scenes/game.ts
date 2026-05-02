import { Callbacks, Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";

export function createGameScene() {
  k.scene("game", (room: Room<RoomState>) => {
    const callbacks = Callbacks.get(room);
    const player = room.state.players?.get(room.sessionId);
    if (!player) return;

    setupScene(room);

    const text = k.add([
      k.text(`score: ${player.score}`),
      k.pos(k.width() - 210, 20),
    ]);

    callbacks.listen(player, "score", (score) => {
      text.text = `score: ${score}`;

      if (score >= 2) {
        room.send("game_over", { winnerId: room.sessionId });
      }
    });

    k.onMousePress(() => {
      room.send("click");
    });

    room.onMessage("game_over", ({ winnerId }: { winnerId: string }) => {
      k.go("game_over", room, {
        isWinner: winnerId === room.sessionId,
      });
    });
  });
}