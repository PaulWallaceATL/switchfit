"use client";

import { MessageCircle, X } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { getDialogueTree } from "@/lib/game/dialogue";
import { getNpc } from "@/lib/game/npc";
import { playChime, playClick } from "@/lib/game/audio";
import type { DialogueAction } from "@/lib/game/types";

/**
 * Branching conversation panel. Renders the active dialogue node + its choices;
 * each choice either navigates to another node or fires a world effect (open a
 * panel, start a scan, toggle the map, grant credits).
 */
export function DialogueBox() {
  const active = useGameStore((s) => s.activeDialogue);
  const gotoNode = useGameStore((s) => s.gotoNode);
  const endDialogue = useGameStore((s) => s.endDialogue);
  const setPanel = useGameStore((s) => s.setPanel);
  const setScanner = useGameStore((s) => s.setScanner);
  const toggleMinimap = useGameStore((s) => s.toggleMinimap);
  const addCredits = useGameStore((s) => s.addCredits);
  const setNpcState = useGameStore((s) => s.setNpcState);

  if (!active) return null;

  const npc = getNpc(active.npcId);
  const tree = getDialogueTree(npc?.dialogueId ?? "");
  const node = tree?.nodes[active.nodeId];
  if (!npc || !node) return null;

  const close = () => {
    setNpcState(npc.id, "idle");
    endDialogue();
  };

  const run = (action: DialogueAction) => {
    playClick();
    switch (action.type) {
      case "goto":
        gotoNode(action.node);
        return;
      case "openPanel":
        setPanel(action.panel);
        close();
        return;
      case "startScan":
        setScanner(true);
        close();
        return;
      case "toggleMap":
        toggleMinimap();
        close();
        return;
      case "grantCredits":
        addCredits(action.amount);
        playChime();
        close();
        return;
      case "end":
      default:
        close();
    }
  };

  return (
    <div className="animate-drawer-in pointer-events-auto absolute bottom-6 left-1/2 z-20 w-[34rem] max-w-[94vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/90 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-3" style={{ background: `linear-gradient(90deg, ${npc.color}33, transparent)` }}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: npc.color }}>
            <MessageCircle className="h-4 w-4 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{npc.name}</p>
            <p className="text-[11px] text-white/50">{npc.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="End conversation"
          className="press rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-white/90">{node.text}</p>
        <div className="mt-4 flex flex-col gap-2">
          {node.choices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => run(choice.action)}
              className="press flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
