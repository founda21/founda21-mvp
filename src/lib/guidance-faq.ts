// Static, pre-written answers to common process questions — deliberately
// not AI-generated. Founders asked for something that "just knows" the
// checkpoints rather than a live chat: this is fully automated (a search
// over fixed content) with no per-question model call, no cost, no risk of
// it drifting into drafting a founder's actual submission for them.
export type FaqEntry = { question: string; answer: string };

export const GUIDANCE_FAQ: FaqEntry[] = [
  {
    question: "What happens if a checkpoint doesn't pass?",
    answer:
      "You'll see specifically what was missing and a top-priority fix. You can resubmit right away — there's no limit on individual checkpoint attempts, only on a full stage failing (see below).",
  },
  {
    question: "What happens if a full stage doesn't pass?",
    answer:
      "There's a 14-day cooldown before you can retry that stage. That's not a punishment — real fixes (new evidence, a rebuilt model, an actual customer conversation) take real time, so rushing back in with the same gaps rarely helps.",
  },
  {
    question: "Can I update my venture stage later?",
    answer:
      "Yes — go to Personal details and update it any time. It only affects which checkpoints you can currently access, not anything you've already passed.",
  },
  {
    question: "Can someone else, or an AI, write my answers for me?",
    answer:
      "You can use whatever tools help you think and write — but the evidence has to be genuinely yours. Checkpoints ask for things only you can actually know (your real numbers, your real customers, your real story), and that's what gets checked.",
  },
  {
    question: "What funding type should I be asking for?",
    answer:
      "See the funding primer you saw before signing up for a plain-language breakdown of grants, equity, loans, and more, and which type of funder typically offers what.",
  },
  {
    question: "How is a checkpoint actually graded?",
    answer:
      "See the \"How Founda21 works\" tab for the full, honest explanation of the five things every checkpoint is assessed on.",
  },
];
