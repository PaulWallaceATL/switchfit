import type { DialogueTree } from "@/lib/game/types";

/**
 * Branching dialogue trees, keyed by NPC `dialogueId`. Each choice carries an
 * action the DialogueBox executes — navigating to another node or triggering a
 * world effect (open a panel, grant credits, toggle the map, start a scan).
 */
export const DIALOGUE_TREES: Record<string, DialogueTree> = {
  fiona: {
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        text: "Hi there! I'm Fiona, your personal stylist. Want to refine your look?",
        choices: [
          { label: "Open my closet", action: { type: "openPanel", panel: "character" } },
          { label: "Scan my body", action: { type: "startScan" } },
          { label: "Give me a styling tip", action: { type: "goto", node: "tip" } },
          { label: "Maybe later", action: { type: "end" } },
        ],
      },
      tip: {
        id: "tip",
        text: "Pair a fitted top with relaxed bottoms — it flatters almost everyone. Here, take some credits to play with!",
        choices: [
          { label: "Thanks, Fiona!", action: { type: "grantCredits", amount: 75 } },
          { label: "Back", action: { type: "goto", node: "intro" } },
        ],
      },
    },
  },

  security: {
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        text: "Welcome to SwitchFit Mall. Need a hand finding your way around?",
        choices: [
          { label: "Show me the map", action: { type: "toggleMap" } },
          { label: "Where's the Fitting Room?", action: { type: "goto", node: "directions" } },
          { label: "I'm good, thanks", action: { type: "end" } },
        ],
      },
      directions: {
        id: "directions",
        text: "The Fitting Room sits along the central arc — boutiques and streetwear flank it on either side. Just follow the storefront signs.",
        choices: [
          { label: "Show me the map", action: { type: "toggleMap" } },
          { label: "Got it", action: { type: "end" } },
        ],
      },
    },
  },

  alex: {
    start: "intro",
    nodes: {
      intro: {
        id: "intro",
        text: "Yo! Arcade Alex here. This whole mall runs on next-gen render tech — pretty sick, right?",
        choices: [
          { label: "What can I do here?", action: { type: "goto", node: "howto" } },
          { label: "Cool, catch you later", action: { type: "end" } },
        ],
      },
      howto: {
        id: "howto",
        text: "Walk into any shop, step up to a podium, and try gear on your avatar. Press E to chat with folks like me. Spend your credits wisely!",
        choices: [{ label: "Nice", action: { type: "end" } }],
      },
    },
  },
};

export function getDialogueTree(id: string): DialogueTree | undefined {
  return DIALOGUE_TREES[id];
}
