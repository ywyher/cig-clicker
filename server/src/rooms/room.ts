import { Room as ColyRoom, Client, CloseCode, AuthContext } from "colyseus";
import { Player, PlayerType } from "./schema/player.js";
import { RoomState } from "./schema/room-state.js";
import { ANSWER_WINDOW_MS, GAP_MS, QUESTION_INTERVAL_MS, QUESTIONS } from "../constants/question.js";
export const SCORE_PENALTY = 5;

export class Room extends ColyRoom {
  maxClients = 4;
  state = new RoomState();
  private reconnections = new Map<string, ReturnType<typeof this.allowReconnection>>();
  private questionTimer: ReturnType<typeof setInterval> | null = null;
  private usedQuestionIds = new Set<number>();
  private currentQuestionId: number | null = null;
  private currentQuestionExpiresAt: number = 0;

  messages = {
    start: (client: Client) => {
      // if (client.sessionId !== this.state.adminId) return;
      this.state.phase = "game"
      this.lock()
      this.broadcast("game_start", {
        firstQuestionAt: Date.now() + GAP_MS,
      });
      this.startQuestionTimer();
    },
    terminate: (client: Client) => {
      if (client.sessionId !== this.state.adminId) return;
      this.disconnect()
      this.broadcast("terminate_room");
    },
    leave: (client: Client) => {
      console.log(`${client.sessionId} left.`)
      this.broadcast("player_left", {
        playerId: client.sessionId
      });
    },
    join: (client: Client) => {
      console.log(`${client.sessionId} joined.`)
      this.broadcast("player_joined", {
        playerId: client.sessionId
      });
    },
    click: (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.score++;
    },
    penalty: (client: Client, { amount }: { amount: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.score = player.score - amount;
    },
    game_over: (_: Client, { winnerId }: { winnerId: string }) => {
      this.stopQuestionTimer();
      this.broadcast("game_over", {
        winnerId: winnerId
      });
    },
    answer: (client: Client, { questionId, choiceIndex }: { questionId: number; choiceIndex: number }) => {
      if (questionId !== this.currentQuestionId) return;

      const question = QUESTIONS.find(q => q.id === questionId);
      if (!question) return;

      const isCorrect = choiceIndex === question.correctIndex;
      if (isCorrect) {
        const player = this.state.players.get(client.sessionId);
        if (player) player.level++;
      } else {
        // const player = this.state.players.get(client.sessionId);
        // if (player) player.score = Math.max(0, player.score - SCORE_PENALTY);
      }

      client.send("question_expired", {
        nextQuestionAt: this.currentQuestionExpiresAt + (QUESTION_INTERVAL_MS - ANSWER_WINDOW_MS),
      });
    },
  }

  private startQuestionTimer() {
    const sendNextQuestion = () => {
      const available = QUESTIONS.filter(q => !this.usedQuestionIds.has(q.id));
      if (available.length === 0) this.usedQuestionIds.clear();

      const question = available[Math.floor(Math.random() * available.length)];
      this.usedQuestionIds.add(question.id);
      this.currentQuestionId = question.id;

      this.currentQuestionExpiresAt = Date.now() + ANSWER_WINDOW_MS;
      this.broadcast("question", {
        id: question.id,
        text: question.text,
        choices: question.choices,
        expiresAt: this.currentQuestionExpiresAt,
      });

      // Expire this specific question after the answer window
      setTimeout(() => {
        if (this.currentQuestionId === question.id) {
          this.currentQuestionId = null;
          this.broadcast("question_expired", {
            nextQuestionAt: this.currentQuestionExpiresAt + GAP_MS,
          });
        }
      }, ANSWER_WINDOW_MS);
    };

    setTimeout(() => {
      sendNextQuestion();
      this.questionTimer = setInterval(sendNextQuestion, QUESTION_INTERVAL_MS);
    }, GAP_MS);
  }

  private stopQuestionTimer() {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  onJoin(client: Client, options: PlayerType & { isAdmin?: boolean }) {
    if (options?.isAdmin) {
      this.state.adminId = client.sessionId;
      return;
    }

    const player = new Player();
    player.name = options.name
    
    this.state.players.set(client.sessionId, player);
  }
  
  async onAuth(client: Client, options: PlayerType & { isAdmin?: boolean }) {
    if (options?.isAdmin) return true;

    if (this.state.phase === "game") throw new Error("Game already started")

    const nameTaken = [...this.state.players.values()].some(
      p => p.name.toLowerCase() === options.name.toLowerCase()
    );
    
    if (nameTaken) throw new Error("Username already taken, Try another one.");
    
    return true;
  }

  async onLeave (client: Client, code: number) {
    this.state.players.delete(client.sessionId);
    
    // if (client.sessionId === this.state.adminId) {
    //   try {
    //     const reconnection = this.allowReconnection(client, 10);
    //     this.reconnections.set(client.sessionId, reconnection);
    //     await reconnection;
    //     this.reconnections.delete(client.sessionId);
    //   } catch (e) {
    //     // Admin timed out - kill the room
    //     this.reconnections.delete(client.sessionId);
    //     this.disconnect();
    //   }
    //   return;
    // }

    // // Mark player as disconnected
    // const player = this.state.players.get(client.sessionId);
    // if (!player) return;

    // // If they clicked leave intentionally, skip reconnection window
    // if (code === CloseCode.CONSENTED) {
    //   this.state.players.delete(client.sessionId);
    //   this.broadcast("player_left", {
    //     playerId: client.sessionId
    //   });
    //   return;
    // }

    // player.connected = false;

    // try {
    //   const reconnection = this.allowReconnection(client, 10);
    //   this.reconnections.set(client.sessionId, reconnection);
    //   await reconnection; // resolves if client reconnects, rejects if timeout
    //   player.connected = true; 
    //   this.reconnections.delete(client.sessionId); // Client reconnected 
    // } catch (e) {
    //   // Timed out -> remove for real
    //   this.reconnections.delete(client.sessionId);
    //   this.state.players.delete(client.sessionId);
    //   this.broadcast("player_left", {
    //     playerId: client.sessionId
    //   });
    // }
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    console.log("room", this.roomId, "disposing...");
  }

}
