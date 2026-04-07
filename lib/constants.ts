import type { Role } from "@/lib/models";

export const DDRAGON_VERSION = "12.6.1";

export const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com/cdn";
export const DDRAGON_IMAGE_BASE = `${DDRAGON_BASE_URL}/img`;
export const DDRAGON_CHAMPION_IMAGE_BASE = `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/champion/`;
export const DDRAGON_ITEM_IMAGE_BASE = `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/item/`;
export const DDRAGON_SPELL_IMAGE_BASE = `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/spell/`;

/** Embedded Data Dragon JSON (patch matches `DDRAGON_VERSION`); images still load from CDN URLs above. */
export { default as DDRAGON_CHAMPION_JSON } from "./data/ddragon/champion.json";
export { default as DDRAGON_RUNES_JSON } from "./data/ddragon/runesReforged.json";
export { default as DDRAGON_ITEMS_JSON } from "./data/ddragon/item.json";
export { default as DDRAGON_SUMMONERS_JSON } from "./data/ddragon/summoner.json";

export const SMITE_SPELL_IDS = [
  "SummonerSmite",
  "SummonerSmiteAvatarOffensive",
  "SummonerSmiteAvatarDefensive",
] as const;

/** ARAM / Poro / Ultimate Spellbook placeholders — not used on Summoner's Rift builds */
export const EXCLUDED_SUMMONER_SPELL_IDS = [
  "SummonerPoroRecall",
  "SummonerPoroThrow",
  "SummonerSnowURFSnowball_Mark",
  "SummonerSnowball",
  "Summoner_UltBookPlaceholder",
  "Summoner_UltBookSmitePlaceholder",
] as const;

export const ROLES: Role[] = ["Top", "Jungle", "Mid", "ADC", "Support"];

export const GENERATOR_STORAGE_KEY = "random-lol-generator-state";
