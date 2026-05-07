import { Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";

export function createGameOverScene() {
  k.scene("game_over", (room: Room<RoomState>, { winners }: { winners: string[] }) => {
    const isTie = winners.length > 1;
    const isWinner = winners.includes(room.sessionId);
    const isAdmin = room.state.adminId === room.sessionId;

    setupScene(room);

    k.add([
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0),
      k.opacity(0.4),
      k.pos(0, 0),
    ]);

    const resultText = isTie
      ? isWinner ? "It's a Tie - You're one of them!" : "It's a Tie!"
      : isAdmin
        ? `${room.state.players.get(winners[0])?.name ?? "Someone"} wins!`
        : isWinner ? "You Win!" : "You Lose";

    const resultColor = isTie
      ? k.rgb(255, 200, 50)
      : isWinner ? k.rgb(255, 215, 0) : k.rgb(200, 80, 80);

    k.add([
      k.text(resultText, { size: 64, align: "center", font: "font" }),
      k.anchor("center"),
      k.pos(k.center()),
      k.color(resultColor),
    ]);

    const subtitle = isAdmin ? "Press Space to start a new game" : "Waiting for host to restart...";
    k.add([
      k.text(subtitle, { size: 24, font: "font" }),
      k.anchor("center"),
      k.pos(k.width() / 2, k.height() / 2 + 80),
      k.color(150, 150, 150),
    ]);

    let y = k.height() / 2 + 140;
    room.state.players.forEach((p, id) => {
      const isYou = id === room.sessionId;
      const isThisWinner = winners.includes(id);
      k.add([
        k.text(`${isThisWinner ? "👑 " : ""}${p.name}: ${p.score}${isYou ? " (you)" : ""}`, { size: 18, font: "font" }),
        k.anchor("center"),
        k.pos(k.width() / 2, y),
        k.color(isYou ? k.rgb(120, 200, 255) : k.rgb(200, 200, 200)),
      ]);
      y += 28;
    });

    if (isAdmin) {
      let restarting = false;
      k.onKeyPress("space", () => {
        if (restarting) return;
        restarting = true;
        room.send("start");
      });
    }
  });
}