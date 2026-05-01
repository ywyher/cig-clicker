import { Callbacks, Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<RoomState>, opts: { isAdmin?: boolean }) => {
    setupScene(room)

    const callbacks = Callbacks.get(room);

    let labelObjs: ReturnType<typeof k.add>[] = [];

    function rebuildLabels() {
      if (!room.state?.players) return;
      labelObjs.forEach(obj => obj.destroy());
      labelObjs = [];
      room.state.players.forEach((player) => {
        const obj = k.add([
          k.text(`player: ${player.name}`, { size: 16 }),
          k.pos(40, 40 + labelObjs.length * 32),
        ]);
        labelObjs.push(obj);
      });
    }

    callbacks.onAdd("players", (player, sessionId) => {
      rebuildLabels();
    });

    callbacks.onRemove("players", () => {
      rebuildLabels();
    });

    if (opts?.isAdmin) {
      const btn = k.add([
        k.text("Start game", { size: 20 }),
        k.pos(k.center().x, k.height() - 60),
        k.anchor("center"),
        k.area(),
      ]);
      btn.onClick(() => room.send("start"));
    }

    room.onMessage("game_start", () => {
      if (opts?.isAdmin) {
        k.go("dashboard", room);
      } else {
        k.go("game", room);
      }
    });

    if (room.state?.players) {
      rebuildLabels();
    } else {
      room.onStateChange.once(() => rebuildLabels());
    }
  });
}