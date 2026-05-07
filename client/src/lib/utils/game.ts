import { k } from "../../main";
export const CHOICE_LABELS = ["A", "B", "C", "D"];

export function showQuestion({
  question,
  onAnswer,
  trackObj,
  lockedUntil,
  expiresAt,
  onThinkEnd
}: {
  question: { id: number; text: string; choices: string[] };
  onAnswer: (choiceIndex: number) => void;
  trackObj: (obj: ReturnType<typeof k.add>) => void;
  lockedUntil: number;
  expiresAt: number;
  onThinkEnd: () => void;
}) {
  const overlay = k.add([
    k.rect(k.width(), k.height()),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.55),
    k.z(10),
    k.fixed(),
  ]);
  trackObj(overlay);

  const cardW = 500;
  const cardX = k.width() / 2 - cardW / 2;
  const cardY = k.height() / 2 - 160;

  const card = k.add([
    k.rect(cardW, 290, { radius: 12 }),
    k.pos(cardX, cardY),
    k.color(245, 245, 245),
    k.z(11),
    k.fixed(),
  ]);
  trackObj(card);

  const questionText = k.add([
    k.text(question.text, { size: 18, width: cardW - 40, font: "font" }),
    k.pos(cardX + 20, cardY + 20),
    k.color(30, 30, 30),
    k.z(12),
    k.fixed(),
  ]);
  trackObj(questionText);

  const lockBarBg = k.add([
    k.rect(cardW - 40, 4, { radius: 2 }),
    k.pos(cardX + 20, cardY + 90),
    k.color(200, 200, 200),
    k.z(12),
    k.fixed(),
  ]);
  trackObj(lockBarBg);

  const lockBar = k.add([
    k.rect(cardW - 40, 4, { radius: 2 }),
    k.pos(cardX + 20, cardY + 90),
    k.color(100, 140, 255),
    k.z(13),
    k.fixed(),
  ]);
  trackObj(lockBar);

  const lockLabel = k.add([
    k.text("", { size: 12, font: "font" }),
    k.pos(cardX + 20, cardY + 100),
    k.color(120, 120, 120),
    k.z(13),
    k.fixed(),
  ]);
  trackObj(lockLabel);

  const isLocked = () => lockedUntil != null && Date.now() < lockedUntil;
  const thinkDuration = lockedUntil ? lockedUntil - Date.now() : 0;
  const answerDuration = expiresAt && lockedUntil ? expiresAt - lockedUntil : expiresAt ? expiresAt - Date.now() : 0;
  let barMode: "think" | "answer" = lockedUntil ? "think" : "answer";

  const lockBarUpdate = k.onUpdate(() => {
    if (barMode === "think" && lockedUntil) {
      const remaining = Math.max(0, lockedUntil - Date.now());
      const frac = remaining / thinkDuration;
      lockBar.width = (cardW - 40) * frac;
      lockBar.color = k.rgb(100, 140, 255);
      lockLabel.text = remaining > 0 ? `Answers unlock in ${Math.ceil(remaining / 1000)}s` : "";
    } else if (barMode === "answer" && expiresAt) {
      const remaining = Math.max(0, expiresAt - Date.now());
      const frac = remaining / answerDuration;
      lockBar.width = (cardW - 40) * frac;
      lockBar.color = k.rgb(80, 200, 120);
      lockLabel.text = remaining > 0 ? `${Math.ceil(remaining / 1000)}s to answer` : "";
    }
  });
  // lockBar have the cancel() method not the destroy() method
  trackObj({ destroy: () => lockBarUpdate.cancel() } as any);

  const buttons: ReturnType<typeof k.add>[] = [];
  const btnLabels: ReturnType<typeof k.add>[] = [];

  question.choices.forEach((choice, i) => {
    const btnY = cardY + 120 + i * 42;

    const btn = k.add([
      k.rect(cardW - 40, 34, { radius: 6 }),
      k.pos(cardX + 20, btnY),
      k.color(200, 200, 200),
      k.area(),
      k.z(12),
      k.fixed(),
    ]);
    trackObj(btn);
    buttons.push(btn);

    const btnLabel = k.add([
      k.text(`${CHOICE_LABELS[i]}.  ${choice}`, { size: 14, font: "font" }),
      k.pos(cardX + 36, btnY + 8),
      k.color(160, 160, 160),
      k.z(13),
      k.fixed(),
    ]);
    trackObj(btnLabel);
    btnLabels.push(btnLabel);

    btn.onClick(() => {
      if (isLocked()) return;
      onAnswer(i);
    });
  });

if (lockedUntil) {
    k.wait(thinkDuration / 1000, () => {
      barMode = "answer";
      buttons.forEach((btn: any) => { btn.color = k.rgb(220, 220, 220); });
      btnLabels.forEach((label: any) => { label.color = k.rgb(40, 40, 40); });
      onThinkEnd();
    });
  } else {
    barMode = "answer";
    buttons.forEach((btn: any) => { btn.color = k.rgb(220, 220, 220); });
    btnLabels.forEach((label: any) => { label.color = k.rgb(40, 40, 40); });
  }
}