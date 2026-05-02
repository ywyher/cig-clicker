import { Callbacks, Room } from "@colyseus/sdk";
import { k } from "../../main";
import { RoomState } from "../../../../server/src/rooms/schema/room-state";

export function setupScene(room: Room<RoomState>) {
  const callbacks = Callbacks.get(room);

  room.onLeave(() => {
    k.go("main");
  });

  const currentPlayerId = room.sessionId;
  let buttonsCreated = false;  // guard against re-runs

  callbacks.listen("adminId", (adminId: string) => {
    if (buttonsCreated) return;
    buttonsCreated = true;

    const isAdmin = adminId === currentPlayerId;

    if (isAdmin) {
      const terminateBtn = k.add([
        k.rect(150, 40, { radius: 6 }),
        k.pos(k.width() - 180, k.height() - 60),
        k.color(k.Color.fromHex("#8e44ad")),
        k.area(),
        k.z(100),
        "terminateBtn",
      ]);

      k.add([
        k.text("Terminate Room", { size: 16 }),
        k.pos(k.width() - 180 + 75, k.height() - 60 + 20),
        k.anchor("center"),
        k.color(k.Color.fromHex("#ffffff")),
        k.z(101),
      ]);

      terminateBtn.onClick(() => {
        room.send("terminate");
      });
    } else {
      const leaveBtn = k.add([
        k.rect(120, 40, { radius: 6 }),
        k.pos(k.width() - 140, k.height() - 60),
        k.color(k.Color.fromHex("#e74c3c")),
        k.area(),
        k.z(100),
        "leaveBtn",
      ]);

      k.add([
        k.text("Leave Room", { size: 16 }),
        k.pos(k.width() - 140 + 60, k.height() - 60 + 20),
        k.anchor("center"),
        k.color(k.Color.fromHex("#ffffff")),
        k.z(101),
      ]);

      leaveBtn.onClick(() => {
        room.send("leave");
        room.leave();
        localStorage.removeItem("reconnectionToken");
        k.go("main")
      });
    }
  });
}