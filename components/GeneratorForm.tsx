"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useRef, useState } from "react";
import type { PlayerSlotConfig, Role } from "@/lib/models";
import { ROLES } from "@/lib/constants";
import { ROLE_ICON_MAP } from "@/lib/roleIcons";

interface GeneratorFormProps {
  playerCount: number;
  playerSlots: PlayerSlotConfig[];
  isLoading: boolean;
  onPlayerCountChange: (value: number) => void;
  onPlayerSlotsChange: (slots: PlayerSlotConfig[]) => void;
  onGenerate: () => void;
}

function updateSlot(
  slots: PlayerSlotConfig[],
  index: number,
  patch: Partial<PlayerSlotConfig>,
): PlayerSlotConfig[] {
  return slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot));
}

function RolePicker({
  value,
  onChange,
  labelId,
}: Readonly<{
  value: Role | null;
  onChange: (role: Role | null) => void;
  labelId: string;
}>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-100 outline-none transition hover:border-zinc-600 focus:border-indigo-400"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {value ? (
            <>
              <img
                src={ROLE_ICON_MAP[value]}
                alt=""
                className="h-5 w-5 shrink-0 rounded object-cover"
              />
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-zinc-400">Any</span>
          )}
        </span>
        <span className="shrink-0 text-zinc-500" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-700 bg-zinc-950 py-1 shadow-xl"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                ?
              </span>
              Any
            </button>
          </li>
          {ROLES.map((role) => (
            <li key={role} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === role}
                className="flex w-full  items-center gap-2 px-3 py-2 text-left text-sm text-zinc-100 transition hover:bg-zinc-800"
                onClick={() => {
                  onChange(role);
                  setOpen(false);
                }}
              >
                <img
                  src={ROLE_ICON_MAP[role]}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded object-cover"
                />
                {role}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function GeneratorForm({
  playerCount,
  playerSlots,
  isLoading,
  onPlayerCountChange,
  onPlayerSlotsChange,
  onGenerate,
}: Readonly<GeneratorFormProps>) {
  const [playersExpanded, setPlayersExpanded] = useState(true);
  const playersContentId = useId();
  const slots = playerSlots.slice(0, playerCount);

  const collapsedSummary =
    slots.length === 0
      ? "No players"
      : slots.map((slot) => slot.displayName.trim() || "—").join(" · ");

  return (
    <>
      <section className="relative z-30 w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-xs">
            <label htmlFor="playerCount" className="mb-2 block text-sm font-medium text-zinc-300">
              Number of players
            </label>
            <input
              id="playerCount"
              type="number"
              min={1}
              max={5}
              value={playerCount}
              onChange={(event) => onPlayerCountChange(Number(event.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-indigo-400"
            />
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="inline-flex h-11 items-center cursor-pointer justify-center rounded-xl bg-indigo-500 px-6 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="mt-6 border-t border-zinc-800 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-zinc-300">Players</h2>
            {playersExpanded ? null : (
              <p className="mt-1 truncate text-xs text-zinc-500" title={collapsedSummary}>
                {collapsedSummary}
              </p>
            )}
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
            aria-expanded={playersExpanded}
            aria-controls={playersContentId}
            onClick={() => setPlayersExpanded((previous) => !previous)}
          >
            <span className="sr-only">{playersExpanded ? "Collapse" : "Expand"} player list</span>
            <span aria-hidden className="text-zinc-500">
              {playersExpanded ? "▼" : "▶"}
            </span>
          </button>
        </div>

        <div id={playersContentId} hidden={!playersExpanded} className="space-y-3">
          <p className="text-xs text-zinc-500">
            Name each player and optionally pick a role. Leave role as &quot;Any&quot; for a random
            role (still respects filter toggles).
          </p>
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div
                key={index} // NOSONAR - fixed player slot index
                className="flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`player-name-${index}`}
                    className="mb-1 block text-xs font-medium text-zinc-500"
                  >
                    Name
                  </label>
                  <input
                    id={`player-name-${index}`}
                    type="text"
                    value={slot.displayName}
                    onChange={(event) =>
                      onPlayerSlotsChange(
                        updateSlot(playerSlots, index, { displayName: event.target.value }),
                      )
                    }
                    placeholder={`Player${index + 1}`}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-indigo-400"
                  />
                </div>
                <div className="sm:w-48">
                  <label
                    htmlFor={`player-role-trigger-${index}`}
                    className="mb-1 block text-xs font-medium text-zinc-500"
                  >
                    Role
                  </label>
                  <RolePicker
                    value={slot.role}
                    onChange={(role) =>
                      onPlayerSlotsChange(updateSlot(playerSlots, index, { role }))
                    }
                    labelId={`player-role-trigger-${index}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 cursor-pointer rounded-full bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400/30 transition hover:bg-indigo-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:bottom-[max(2rem,env(safe-area-inset-bottom))]"
      >
        {isLoading ? "Generating..." : "Generate"}
      </button>
    </>
  );
}
