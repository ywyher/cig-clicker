import { Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";

export function createGameOverScene() {
  k.scene("game_over", (room: Room<RoomState>, { isWinner }: { isWinner: boolean }) => {
    setupScene(room);

    const isAdmin = room.state.adminId === room.sessionId;
    const winner = [...room.state.players.values()].find(p => p.score >= 2);

    k.add([
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0),
      k.opacity(0.4),
      k.pos(0, 0),
    ]);

    // Result text — admin sees who won, not "you lose"
    const resultText = isAdmin
      ? `${winner?.name ?? "Someone"} wins!`
      : isWinner ? "You Win! 🏆" : "You Lose";

    const resultColor = isAdmin
      ? k.rgb(200, 200, 200)
      : isWinner ? k.rgb(255, 215, 0) : k.rgb(200, 80, 80);

    k.add([
      k.text(resultText, { size: 64, align: "center", font: "font" }),
      k.anchor("center"),
      k.pos(k.center()),
      k.color(resultColor),
    ]);

    // Subtitle
    const subtitle = isAdmin ? "Press Space to start a new game" : "Press Space to play again";
    k.add([
      k.text(subtitle, { size: 24, font: "font" }),
      k.anchor("center"),
      k.pos(k.width() / 2, k.height() / 2 + 80),
      k.color(150, 150, 150),
    ]);

    // Player scores summary
    let y = k.height() / 2 + 140;
    room.state.players.forEach((p, id) => {
      k.add([
        k.text(`${p.name}: ${p.score}${id === room.sessionId ? " (you)" : ""}`, { size: 18, font: "font" }),
        k.anchor("center"),
        k.pos(k.width() / 2, y),
        k.color(id === room.sessionId ? k.rgb(120, 200, 255) : k.rgb(200, 200, 200)),
      ]);
      y += 28;
    });

    // Prevent firing multiple times if space is pressed repeatedly
    let restarting = false;

    k.onKeyPress("space", () => {
      if (restarting) return;

      if (isAdmin) {
        restarting = true;
        // room.send("start");
        // k.go("dashboard", room);  // admin goes back to dashboard, not game
      } else {
        k.add([
          k.text("Waiting for host to restart...", { size: 16, font: "font" }),
          k.anchor("center"),
          k.pos(k.width() / 2, y + 20),
          k.color(150, 150, 150),
        ]);
      }
    });
  });
}