"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLolData } from "@/lib/api";
import { GENERATOR_STORAGE_KEY, ROLES } from "@/lib/constants";
import type {
  GenerationFilters,
  LolDataSet,
  PlayerBuild,
  PlayerSlotConfig,
  Role,
} from "@/lib/models";
import { generatePlayers, rerollSinglePlayer } from "@/lib/random";

interface StoredState {
  playerCount: number;
  players: PlayerBuild[];
  filters: GenerationFilters;
  playerSlots?: PlayerSlotConfig[];
}

const DEFAULT_FILTERS: GenerationFilters = {
  disabledRoles: [],
  disabledChampionIds: [],
  disabledItemIds: [],
  disabledSummonerSpellIds: [],
};

function createDefaultSlots(count: number): PlayerSlotConfig[] {
  return Array.from({ length: count }, (_, index) => ({
    displayName: `Player${index + 1}`,
    role: null,
  }));
}

function migratePlayerBuild(player: unknown): PlayerBuild | null {
  if (!player || typeof player !== "object") {
    return null;
  }
  const p = player as PlayerBuild;
  if (
    typeof p.id !== "string"
    || !Array.isArray(p.items)
    || !Array.isArray(p.summonerSpells)
    || !p.runes?.primaryMinors
    || !Array.isArray(p.runes.primaryMinors)
  ) {
    return null;
  }
  return {
    ...p,
    displayName: p.displayName ?? "Player",
    roleLocked: typeof p.roleLocked === "boolean" ? p.roleLocked : false,
  };
}

function normalizeFilters(filters: GenerationFilters | undefined): GenerationFilters {
  if (!filters) {
    return DEFAULT_FILTERS;
  }

  return {
    disabledRoles: (filters.disabledRoles ?? []).filter((role): role is Role => ROLES.includes(role)),
    disabledChampionIds: filters.disabledChampionIds ?? [],
    disabledItemIds: filters.disabledItemIds ?? [],
    disabledSummonerSpellIds: filters.disabledSummonerSpellIds ?? [],
  };
}

export function useGenerator() {
  const [playerCount, setPlayerCount] = useState(1);
  const [playerSlots, setPlayerSlots] = useState<PlayerSlotConfig[]>(() => createDefaultSlots(1));
  const [players, setPlayers] = useState<PlayerBuild[]>([]);
  const [filters, setFilters] = useState<GenerationFilters>(DEFAULT_FILTERS);
  const [data, setData] = useState<LolDataSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInArray = useCallback((arr: string[], value: string) => (
    arr.includes(value) ? arr.filter((entry) => entry !== value) : [...arr, value]
  ), []);

  useEffect(() => {
    setData(getLolData());

    const saved = globalThis.localStorage.getItem(GENERATOR_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredState;
        const count = Math.max(1, Math.min(5, parsed.playerCount));
        setPlayerCount(count);
        setPlayers(
          (parsed.players ?? [])
            .map(migratePlayerBuild)
            .filter((entry): entry is PlayerBuild => entry != null),
        );
        setFilters(normalizeFilters(parsed.filters));
        if (parsed.playerSlots?.length === count) {
          setPlayerSlots(parsed.playerSlots);
        } else {
          setPlayerSlots(createDefaultSlots(count));
        }
      } catch {
        globalThis.localStorage.removeItem(GENERATOR_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    setPlayerSlots((previous) => {
      if (previous.length === playerCount) {
        return previous;
      }
      return Array.from({ length: playerCount }, (_, index) => ({
        displayName: previous[index]?.displayName ?? `Player${index + 1}`,
        role: previous[index]?.role ?? null,
      }));
    });
  }, [playerCount]);

  useEffect(() => {
    const state: StoredState = { playerCount, players, filters, playerSlots };
    globalThis.localStorage.setItem(GENERATOR_STORAGE_KEY, JSON.stringify(state));
  }, [playerCount, players, filters, playerSlots]);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const fromUrl = Number(params.get("players"));
    if (Number.isFinite(fromUrl) && fromUrl >= 1 && fromUrl <= 5) {
      setPlayerCount(fromUrl);
    }
  }, []);

  const generate = useCallback((nextCount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const lolData = data ?? getLolData();
      setData(lolData);
      const clamped = Math.max(1, Math.min(5, nextCount));
      setPlayerCount(clamped);
      setPlayers(
        generatePlayers(lolData, clamped, filters, playerSlots.slice(0, clamped)),
      );

      const params = new URLSearchParams(globalThis.location.search);
      params.set("players", String(clamped));
      globalThis.history.replaceState(null, "", `?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate with current filters.");
    } finally {
      setIsLoading(false);
    }
  }, [data, filters, playerSlots]);

  const rerollPlayer = useCallback((playerId: string) => {
    try {
      setError(null);
      const lolData = data ?? getLolData();
      setData(lolData);
      setPlayers((prev) => rerollSinglePlayer(lolData, prev, playerId, filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reroll with current filters.");
    }
  }, [data, filters]);

  const copyBuild = useCallback(async (player: PlayerBuild) => {
    const text = [
      `${player.displayName}: ${player.champion.name} - ${player.role}`,
      `Keystone: ${player.runes.keystone.name}`,
      `Primary: ${player.runes.primaryMinors.map((rune) => rune.name).join(", ")}`,
      `Secondary: ${player.runes.secondaryRunes.map((rune) => rune.name).join(", ")}`,
      `Items: ${player.items.map((item) => item.name).join(", ")}`,
      `Spells: ${player.summonerSpells.map((spell) => spell.name).join(", ")}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
  }, []);

  const toggleRole = useCallback((role: Role) => {
    setFilters((prev) => ({
      ...prev,
      disabledRoles: toggleInArray(prev.disabledRoles, role) as Role[],
    }));
  }, [toggleInArray]);

  const toggleChampion = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      disabledChampionIds: toggleInArray(prev.disabledChampionIds, id),
    }));
  }, [toggleInArray]);

  const toggleItem = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      disabledItemIds: toggleInArray(prev.disabledItemIds, id),
    }));
  }, [toggleInArray]);

  const toggleSummonerSpell = useCallback((id: string) => {
    setFilters((prev) => ({
      ...prev,
      disabledSummonerSpellIds: toggleInArray(prev.disabledSummonerSpellIds, id),
    }));
  }, [toggleInArray]);

  const setAllRolesEnabled = useCallback(() => {
    setFilters((prev) => ({ ...prev, disabledRoles: [] }));
  }, []);

  const setAllRolesDisabled = useCallback(() => {
    setFilters((prev) => ({ ...prev, disabledRoles: [...ROLES] }));
  }, []);

  const setAllChampionsEnabled = useCallback(() => {
    setFilters((prev) => ({ ...prev, disabledChampionIds: [] }));
  }, []);

  const setAllChampionsDisabled = useCallback((championIds: string[]) => {
    setFilters((prev) => ({ ...prev, disabledChampionIds: [...championIds] }));
  }, []);

  const setAllItemsEnabled = useCallback(() => {
    setFilters((prev) => ({ ...prev, disabledItemIds: [] }));
  }, []);

  const setAllItemsDisabled = useCallback((itemIds: string[]) => {
    setFilters((prev) => ({ ...prev, disabledItemIds: [...itemIds] }));
  }, []);

  const setAllSummonersEnabled = useCallback(() => {
    setFilters((prev) => ({ ...prev, disabledSummonerSpellIds: [] }));
  }, []);

  const setAllSummonersDisabled = useCallback((summonerIds: string[]) => {
    setFilters((prev) => ({ ...prev, disabledSummonerSpellIds: [...summonerIds] }));
  }, []);

  return useMemo(() => ({
    playerCount,
    setPlayerCount,
    playerSlots,
    setPlayerSlots,
    players,
    filters,
    data,
    isLoading,
    error,
    generate,
    rerollPlayer,
    copyBuild,
    toggleRole,
    toggleChampion,
    toggleItem,
    toggleSummonerSpell,
    setAllRolesEnabled,
    setAllRolesDisabled,
    setAllChampionsEnabled,
    setAllChampionsDisabled,
    setAllItemsEnabled,
    setAllItemsDisabled,
    setAllSummonersEnabled,
    setAllSummonersDisabled,
  }), [
    playerCount,
    playerSlots,
    players,
    filters,
    data,
    isLoading,
    error,
    generate,
    rerollPlayer,
    copyBuild,
    toggleRole,
    toggleChampion,
    toggleItem,
    toggleSummonerSpell,
    setAllRolesEnabled,
    setAllRolesDisabled,
    setAllChampionsEnabled,
    setAllChampionsDisabled,
    setAllItemsEnabled,
    setAllItemsDisabled,
    setAllSummonersEnabled,
    setAllSummonersDisabled,
  ]);
}
