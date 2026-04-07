export type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

export interface Champion {
  id: string;
  name: string;
  image: string;
}

export interface RuneTree {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: RuneSlot[];
}

export interface RuneSlot {
  runes: Rune[];
}

export interface Rune {
  id: number;
  key: string;
  name: string;
  icon: string;
}

export interface Item {
  id: string;
  name: string;
  image: string;
}

export interface SummonerSpell {
  id: string;
  name: string;
  image: string;
}

export interface RunePage {
  primaryTree: RuneTree;
  keystone: Rune;
  primaryMinors: [Rune, Rune, Rune];
  secondaryTree: RuneTree;
  secondaryRunes: [Rune, Rune];
}

/** Per-slot form config before generate (one entry per player slot). */
export interface PlayerSlotConfig {
  displayName: string;
  /** If set, generation assigns exactly this role (must be allowed by filters). */
  role: Role | null;
}

export interface PlayerBuild {
  id: string;
  displayName: string;
  champion: Champion;
  role: Role;
  /** True when the user picked a role in the form; re-roll keeps that role. */
  roleLocked: boolean;
  runes: RunePage;
  items: Item[];
  summonerSpells: [SummonerSpell, SummonerSpell];
}

export interface LolDataSet {
  champions: Champion[];
  runeTrees: RuneTree[];
  items: Item[];
  itemsFinal: Item[];
  /** Completed boot items only (tier 2+), subset of item tags including `Boots`. */
  bootsFinal: Item[];
  summonerSpells: SummonerSpell[];
}

export interface GenerationFilters {
  disabledRoles: Role[];
  disabledChampionIds: string[];
  disabledItemIds: string[];
  disabledSummonerSpellIds: string[];
}
