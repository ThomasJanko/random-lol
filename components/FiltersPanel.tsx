"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import type { Champion, GenerationFilters, Item, Role, SummonerSpell } from "@/lib/models";
import { ROLES } from "@/lib/constants";
import { ROLE_ICON_MAP } from "@/lib/roleIcons";

interface FiltersPanelProps {
  filters: GenerationFilters;
  champions: Champion[];
  items: Item[];
  summonerSpells: SummonerSpell[];
  onToggleRole: (role: Role) => void;
  onToggleChampion: (id: string) => void;
  onToggleItem: (id: string) => void;
  onToggleSummonerSpell: (id: string) => void;
  onEnableAllRoles: () => void;
  onDisableAllRoles: () => void;
  onEnableAllChampions: () => void;
  onDisableAllChampions: () => void;
  onEnableAllItems: () => void;
  onDisableAllItems: () => void;
  onEnableAllSummoners: () => void;
  onDisableAllSummoners: () => void;
}

function SearchableToggleList({
  title,
  searchPlaceholder,
  entries,
  isDisabled,
  onToggle,
  onEnableAll,
  onDisableAll,
}: Readonly<{
  title: string;
  searchPlaceholder: string;
  entries: { id: string; name: string; image: string }[];
  isDisabled: (id: string) => boolean;
  onToggle: (id: string) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
}>) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return entries.filter((entry) => entry.name.toLowerCase().includes(lower));
  }, [entries, query]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEnableAll}
            className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            Enable all
          </button>
          <button
            type="button"
            onClick={onDisableAll}
            className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold text-zinc-200 transition hover:border-rose-400 hover:text-rose-300"
          >
            Disable all
          </button>
        </div>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-indigo-400"
      />
      <div className="max-h-52 space-y-1 overflow-auto pr-1">
        {filtered.map((entry) => (
          <label key={entry.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-800/70">
            <input
              type="checkbox"
              checked={!isDisabled(entry.id)}
              onChange={() => onToggle(entry.id)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-indigo-500"
            />
            <img
              src={entry.image}
              alt={entry.name}
              className="h-6 w-6 rounded object-cover"
            />
            <span className="text-sm text-zinc-200">{entry.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function FiltersPanel({
  filters,
  champions,
  items,
  summonerSpells,
  onToggleRole,
  onToggleChampion,
  onToggleItem,
  onToggleSummonerSpell,
  onEnableAllRoles,
  onDisableAllRoles,
  onEnableAllChampions,
  onDisableAllChampions,
  onEnableAllItems,
  onDisableAllItems,
  onEnableAllSummoners,
  onDisableAllSummoners,
}: Readonly<FiltersPanelProps>) {
  const [expanded, setExpanded] = useState(true);
  const panelContentId = "active-pool-filters-content";

  return (
    <section className="relative z-10 w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-lg backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Active Pool Filters
        </h2>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
          aria-expanded={expanded}
          aria-controls={panelContentId}
          onClick={() => setExpanded((previous) => !previous)}
        >
          <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
          <span aria-hidden className="text-zinc-500">
            {expanded ? "▼" : "▶"}
          </span>
        </button>
      </div>

      <div id={panelContentId} hidden={!expanded}>
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-200">Roles</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onEnableAllRoles}
              className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              Enable all
            </button>
            <button
              type="button"
              onClick={onDisableAllRoles}
              className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold text-zinc-200 transition hover:border-rose-400 hover:text-rose-300"
            >
              Disable all
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => {
            const active = !filters.disabledRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => onToggleRole(role)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400"
                }`}
              >
                <img src={ROLE_ICON_MAP[role]} alt={role} className="h-4 w-4 rounded-sm object-cover" />
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <SearchableToggleList
          title="Champions"
          searchPlaceholder="Search champion..."
          entries={champions.map((champion) => ({ id: champion.id, name: champion.name, image: champion.image }))}
          isDisabled={(id) => filters.disabledChampionIds.includes(id)}
          onToggle={onToggleChampion}
          onEnableAll={onEnableAllChampions}
          onDisableAll={onDisableAllChampions}
        />
        <SearchableToggleList
          title="Items"
          searchPlaceholder="Search item..."
          entries={items.map((item) => ({ id: item.id, name: item.name, image: item.image }))}
          isDisabled={(id) => filters.disabledItemIds.includes(id)}
          onToggle={onToggleItem}
          onEnableAll={onEnableAllItems}
          onDisableAll={onDisableAllItems}
        />
        <SearchableToggleList
          title="Summoner Spells"
          searchPlaceholder="Search spell..."
          entries={summonerSpells.map((spell) => ({ id: spell.id, name: spell.name, image: spell.image }))}
          isDisabled={(id) => filters.disabledSummonerSpellIds.includes(id)}
          onToggle={onToggleSummonerSpell}
          onEnableAll={onEnableAllSummoners}
          onDisableAll={onDisableAllSummoners}
        />
      </div>
      </div>
    </section>
  );
}
