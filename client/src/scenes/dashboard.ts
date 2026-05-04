import { Callbacks, Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";
import { PlayerType } from "../../../server/src/rooms/schema/player";

export function createDashboardScene() {
  k.scene("dashboard", (room: Room<RoomState>) => {
    setupScene(room);
    const callbacks = Callbacks.get(room)

    const scoreLabels = new Map<string, ReturnType<typeof k.add>>();

    let index = 0;
    room.state.players.forEach((player, sessionId) => {
      const label = k.add([
        k.text(`${player.name}: ${player.score}`, { size: 16, font: "font" }),
        k.pos(40, 40 + index * 32),
      ]);
      scoreLabels.set(sessionId, label);
      index++;

      callbacks.listen(player, "score", (score, _prev) => {
        label.text = `${player.name}: ${String(score)}`
      });
    });

    callbacks.onRemove("players", (_player: PlayerType, sessionId: string) => {
      scoreLabels.get(sessionId)?.destroy();
      scoreLabels.delete(sessionId);
    });

    room.onMessage("game_over", ({ winnerId }: { winnerId: string }) => {
      k.go("game_over", room, { isWinner: false });
    });
  });
}