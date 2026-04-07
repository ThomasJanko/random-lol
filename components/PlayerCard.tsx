"use client";
/* eslint-disable @next/next/no-img-element */

import { useId, useState } from "react";
import type { PlayerBuild } from "@/lib/models";
import { DDRAGON_IMAGE_BASE } from "@/lib/constants";
import { ROLE_ICON_MAP } from "@/lib/roleIcons";

interface PlayerCardProps {
  index: number;
  player: PlayerBuild;
  onReroll: (playerId: string) => void;
  onCopyBuild: (player: PlayerBuild) => void;
}

function IconRow({ title, icons }: Readonly<{ title: string; icons: { id: string | number; name: string; image: string }[] }>) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</p>
      <div className="flex flex-wrap gap-2">
        {icons.map((icon) => (
          <img
            key={icon.id}
            src={icon.image}
            alt={icon.name}
            title={icon.name}
            className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-950 object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export function PlayerCard({ index, player, onReroll, onCopyBuild }: Readonly<PlayerCardProps>) {
  const [expanded, setExpanded] = useState(true);
  const detailsId = useId();

  const runeIcons = [
    { id: `primary-${player.runes.keystone.id}`, name: player.runes.keystone.name, image: `${DDRAGON_IMAGE_BASE}/${player.runes.keystone.icon}` },
    ...player.runes.primaryMinors.map((rune) => ({
      id: `primary-${rune.id}`,
      name: rune.name,
      image: `${DDRAGON_IMAGE_BASE}/${rune.icon}`,
    })),
    ...player.runes.secondaryRunes.map((rune) => ({
      id: `secondary-${rune.id}`,
      name: rune.name,
      image: `${DDRAGON_IMAGE_BASE}/${rune.icon}`,
    })),
  ];

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-indigo-400/80 hover:shadow-indigo-500/20">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-100">{player.displayName}</p>
          <p className="text-xs text-zinc-500">Slot {index + 1}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200">
            <img src={ROLE_ICON_MAP[player.role]} alt={player.role} className="h-4 w-4 rounded-sm object-cover" />
            {player.role}
          </p>
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-zinc-700 px-2 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((previous) => !previous)}
          >
            <span className="sr-only">{expanded ? "Collapse" : "Expand"} build details</span>
            <span aria-hidden className="text-zinc-500">
              {expanded ? "▼" : "▶"}
            </span>
          </button>
        </div>
      </div>

      <div id={detailsId} hidden={!expanded}>
        <div className="mb-4 flex items-center gap-3">
          <img
            src={player.champion.image}
            alt={player.champion.name}
            className="h-16 w-16 rounded-xl border border-zinc-700 object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">{player.champion.name}</h3>
            <p className="text-sm text-zinc-400">
              {player.runes.primaryTree.name} / {player.runes.secondaryTree.name}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <IconRow title="Runes" icons={runeIcons} />
          <IconRow
            title="Items"
            icons={player.items.map((item) => ({ id: item.id, name: item.name, image: item.image }))}
          />
          <IconRow
            title="Summoner Spells"
            icons={player.summonerSpells.map((spell) => ({ id: spell.id, name: spell.name, image: spell.image }))}
          />
        </div>
      </div>

      {expanded ? null : (
        <div className="mb-4 flex items-center gap-2">
          <img
            src={player.champion.image}
            alt=""
            className="h-10 w-10 rounded-lg border border-zinc-700 object-cover"
          />
          <p className="truncate text-sm font-medium text-zinc-200">{player.champion.name}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2 border-t border-zinc-800/80 pt-4">
        <button
          type="button"
          onClick={() => onReroll(player.id)}
          className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-indigo-400 hover:text-indigo-300"
        >
          Re-roll
        </button>
        <button
          type="button"
          onClick={() => onCopyBuild(player)}
          className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
        >
          Copy Build
        </button>
      </div>
    </article>
  );
}
