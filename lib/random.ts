import type {
  GenerationFilters,
  Item,
  LolDataSet,
  PlayerBuild,
  PlayerSlotConfig,
  Role,
  Rune,
  RunePage,
  RuneTree,
  SummonerSpell,
} from "@/lib/models";
import { ROLES, SMITE_SPELL_IDS } from "@/lib/constants";

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(items.length)];
}

function pickUnique<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

/**
 * Assigns one role per player: fixed slots use `desiredRoles[i]`; others get random roles from
 * `activeRoles`, unique when possible (excluding roles already taken by fixed picks).
 */
function assignRolesWithSlotPreferences(
  playerCount: number,
  activeRoles: Role[],
  desiredRoles: (Role | null)[],
): Role[] {
  if (desiredRoles.length !== playerCount) {
    throw new Error("Player slot configuration does not match player count.");
  }
  if (activeRoles.length === 0) {
    throw new Error("Activate at least 1 role.");
  }

  const assigned: Role[] = new Array(playerCount);
  const usedByFixed = new Set<Role>();

  for (let i = 0; i < playerCount; i++) {
    const wanted = desiredRoles[i];
    if (wanted !== null) {
      if (!activeRoles.includes(wanted)) {
        throw new Error(
          `Role "${wanted}" is not available for player ${i + 1} (disabled in filters).`,
        );
      }
      assigned[i] = wanted;
      usedByFixed.add(wanted);
    }
  }

  const freeIndices: number[] = [];
  for (let i = 0; i < playerCount; i++) {
    if (desiredRoles[i] === null) {
      freeIndices.push(i);
    }
  }

  if (freeIndices.length === 0) {
    return assigned;
  }

  const remainingPool = activeRoles.filter((role) => !usedByFixed.has(role));

  if (freeIndices.length <= remainingPool.length) {
    const picked = pickUnique(remainingPool, freeIndices.length);
    freeIndices.forEach((idx, j) => {
      assigned[idx] = picked[j];
    });
    return assigned;
  }

  for (const idx of freeIndices) {
    assigned[idx] = pickOne(activeRoles);
  }
  return assigned;
}

function buildRunePage(runeTrees: RuneTree[]): RunePage {
  const primaryTree = pickOne(runeTrees);
  const secondaryTree = pickOne(runeTrees.filter((tree) => tree.id !== primaryTree.id));

  const [keystoneSlot, ...minorSlots] = primaryTree.slots;
  const keystone = pickOne(keystoneSlot.runes);
  const primaryMinors = minorSlots.map((slot) => pickOne(slot.runes)) as [Rune, Rune, Rune];

  const secondaryCandidates = secondaryTree.slots.flatMap((slot) => slot.runes);
  const secondaryRunes = pickUnique(secondaryCandidates, 2) as [Rune, Rune];

  return {
    primaryTree,
    keystone,
    primaryMinors,
    secondaryTree,
    secondaryRunes,
  };
}

function buildItems(items: Item[]): Item[] {
  return pickUnique(items, 6);
}

function isSmite(spell: SummonerSpell): boolean {
  return SMITE_SPELL_IDS.includes(spell.id as (typeof SMITE_SPELL_IDS)[number]);
}

function getPreferredSmite(spells: SummonerSpell[]): SummonerSpell | null {
  return spells.find((spell) => spell.id === "SummonerSmite")
    ?? spells.find((spell) => isSmite(spell))
    ?? null;
}

function buildSummonerSpells(
  role: Role,
  activeSpells: SummonerSpell[],
  allSpells: SummonerSpell[],
): [SummonerSpell, SummonerSpell] {
  if (role === "Jungle") {
    const smite = getPreferredSmite(allSpells);
    if (!smite) {
      throw new Error("Smite is unavailable in the summoner spell dataset.");
    }
    const partnerPool = activeSpells.filter((spell) => spell.id !== smite.id);
    if (partnerPool.length < 1) {
      throw new Error("Activate at least 1 non-Smite summoner spell for Jungle.");
    }
    return [smite, pickOne(partnerPool)];
  }

  return pickUnique(activeSpells, 2) as [SummonerSpell, SummonerSpell];
}

export function generatePlayers(
  data: LolDataSet,
  playerCount: number,
  filters: GenerationFilters,
  slotConfigs: PlayerSlotConfig[],
): PlayerBuild[] {
  const clampedPlayerCount = Math.max(1, Math.min(5, playerCount));

  const activeChampions = data.champions.filter(
    (champion) => !filters.disabledChampionIds.includes(champion.id),
  );
  const activeRoles = ROLES.filter((role) => !filters.disabledRoles.includes(role));
  const activeItems = data.itemsFinal.filter((item) => !filters.disabledItemIds.includes(item.id));
  const activeSummoners = data.summonerSpells.filter(
    (spell) => !filters.disabledSummonerSpellIds.includes(spell.id),
  );

  if (activeChampions.length < clampedPlayerCount) {
    throw new Error(`Activate at least ${clampedPlayerCount} champions.`);
  }
  if (activeItems.length < 6) {
    throw new Error("Activate at least 6 items.");
  }
  if (activeSummoners.length < 2) {
    throw new Error("Activate at least 2 summoner spells.");
  }
  if (activeRoles.length === 0) {
    throw new Error("Activate at least 1 role.");
  }

  const slots = slotConfigs.slice(0, clampedPlayerCount);
  if (slots.length !== clampedPlayerCount) {
    throw new Error("Player names / roles: count mismatch.");
  }

  const desiredRoles = slots.map((slot) => slot.role);
  const champions = pickUnique(activeChampions, clampedPlayerCount);
  const roles = assignRolesWithSlotPreferences(clampedPlayerCount, activeRoles, desiredRoles);

  return champions.map((champion, index) => {
    const slot = slots[index];
    const role = roles[index];
    const roleLocked = slot.role !== null;
    const displayName = slot.displayName.trim() || `Player${index + 1}`;

    return {
      id: `player-${index + 1}-${champion.id}`,
      displayName,
      champion,
      role,
      roleLocked,
      runes: buildRunePage(data.runeTrees),
      items: buildItems(activeItems),
      summonerSpells: buildSummonerSpells(role, activeSummoners, data.summonerSpells),
    };
  });
}

export function rerollSinglePlayer(
  data: LolDataSet,
  current: PlayerBuild[],
  playerId: string,
  filters: GenerationFilters,
): PlayerBuild[] {
  const activeChampionPool = data.champions.filter(
    (champion) => !filters.disabledChampionIds.includes(champion.id),
  );
  const activeRoles = ROLES.filter((role) => !filters.disabledRoles.includes(role));
  const activeItems = data.itemsFinal.filter((item) => !filters.disabledItemIds.includes(item.id));
  const activeSummoners = data.summonerSpells.filter(
    (spell) => !filters.disabledSummonerSpellIds.includes(spell.id),
  );

  if (activeChampionPool.length === 0 || activeRoles.length === 0 || activeItems.length < 6 || activeSummoners.length < 2) {
    throw new Error("Not enough active filters to reroll.");
  }

  const existingChampions = new Set(
    current.filter((player) => player.id !== playerId).map((player) => player.champion.id),
  );

  return current.map((player) => {
    if (player.id !== playerId) {
      return player;
    }

    const availableChampions = activeChampionPool.filter(
      (champion) => !existingChampions.has(champion.id),
    );
    const champion = pickOne(
      availableChampions.length > 0 ? availableChampions : activeChampionPool,
    );

    const nextRole = player.roleLocked ? player.role : pickOne(activeRoles);

    return {
      ...player,
      id: `${player.id.split("-").slice(0, 2).join("-")}-${champion.id}`,
      champion,
      role: nextRole,
      runes: buildRunePage(data.runeTrees),
      items: buildItems(activeItems),
      summonerSpells: buildSummonerSpells(nextRole, activeSummoners, data.summonerSpells),
    };
  });
}
