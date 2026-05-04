import { Callbacks, Room } from "@colyseus/sdk";
import { k } from "../main";
import { RoomState } from "../../../server/src/rooms/schema/room-state";
import { setupScene } from "../lib/utils/room";
import { showQuestion } from "../lib/utils/game";
import { Question } from "../../../server/src/constants/question";

export function createGameScene() {
  k.scene("game", (room: Room<RoomState>, { firstQuestionAt }: { firstQuestionAt: number }) => {
    let score = 0;
    let level = 1;
    const callbacks = Callbacks.get(room);
    const player = room.state.players?.get(room.sessionId);
    if (!player) return;
    setupScene(room);

    const scoreText = k.add([
      k.text(`score: ${player.score}`, {
        font: "font"
      }),
      k.pos(k.width() - 210, 20),
    ]);
    const levelText = k.add([
      k.text(`Level: ${player.level}`, {
        font: "font"
      }),
      k.pos(k.width() - 210, 80),
    ]);

    const timerLabel = k.add([
      k.text("", { size: 18, font: "font" }),
      k.pos(k.width() / 2, 20),
      k.anchor("center"),
    ]);

    let timerDeadline: number | null = firstQuestionAt;
    let timerMode: "next" | "expiry" | null = "next";

    k.onUpdate(() => {
      if (!timerDeadline || !timerMode) {
        timerLabel.text = "";
        return;
      }
      const secsLeft = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
      timerLabel.text = timerMode === "next"
        ? `Next question in ${secsLeft}s`
        : `Answer in ${secsLeft}s`;
    });

    callbacks.listen(player, "score", (serverScore) => {
      score = serverScore;
      scoreText.text = `score: ${serverScore}`;
    });

    callbacks.listen(player, "level", (serverLevel) => {
      level = serverLevel;
      levelText.text = `level: ${serverLevel}`;
    });

    let questionActive = false;
    let justAnswered = false; // prevent same click from choosing an answer and increasing the score
    let activeQuestionObjects: ReturnType<typeof k.add>[] = [];

    k.onMousePress(() => {
      if (questionActive || justAnswered) return;
      if (score >= 100) {
        room.send("game_over", { winnerId: room.sessionId });
        return;
      }
      room.send("click");
    });

    const cleanupQuestion = () => {
      activeQuestionObjects.forEach(obj => k.destroy(obj));
      activeQuestionObjects = [];
      questionActive = false;
      justAnswered = true;
      // clear it next frame
      k.wait(0.1, () => { justAnswered = false; });
    };

    room.onMessage("question", (question: Omit<Question, "correctIndex"> & { expiresAt: number }) => {
      if (questionActive) return;
      questionActive = true;

      timerMode = "expiry";
      timerDeadline = question.expiresAt;

      showQuestion({
        question,
        onAnswer: (choiceIndex: number) => {
          room.send("answer", { questionId: question.id, choiceIndex });
          timerMode = "next"
          cleanupQuestion();
        },
        trackObj: (obj) => activeQuestionObjects.push(obj),
      });
    });

    room.onMessage("question_expired", ({ nextQuestionAt }: { nextQuestionAt: number }) => {
      cleanupQuestion();
      timerMode = "next";
      timerDeadline = nextQuestionAt;
    });

    room.onMessage("game_over", ({ winnerId }: { winnerId: string }) => {
      timerMode = null;
      timerDeadline = null;
      k.go("game_over", room, { isWinner: winnerId === room.sessionId });
    });
  });
}