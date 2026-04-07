import type { Champion, Item, LolDataSet, RuneTree, SummonerSpell } from "@/lib/models";
import {
  DDRAGON_CHAMPION_IMAGE_BASE,
  DDRAGON_CHAMPION_JSON,
  DDRAGON_ITEM_IMAGE_BASE,
  DDRAGON_ITEMS_JSON,
  DDRAGON_RUNES_JSON,
  DDRAGON_SPELL_IMAGE_BASE,
  DDRAGON_SUMMONERS_JSON,
  EXCLUDED_SUMMONER_SPELL_IDS,
} from "@/lib/constants";

const SUMMONER_BLOCKLIST = new Set<string>(EXCLUDED_SUMMONER_SPELL_IDS);

interface DDragonDataMap<T> {
  data: Record<string, T>;
}

interface DDragonChampionEntry {
  id: string;
  name: string;
  image: { full: string };
}

interface DDragonItemEntry {
  name: string;
  image: { full: string };
  tags?: string[];
  maps?: Record<string, boolean>;
  gold?: { total: number };
  inStore?: boolean;
  requiredChampion?: string;
  consumed?: boolean;
  depth?: number;
  into?: string[];
}

interface DDragonSpellEntry {
  id: string;
  name: string;
  image: { full: string };
}

let cachedData: LolDataSet | null = null;

function mapChampions(raw: DDragonDataMap<DDragonChampionEntry>): Champion[] {
  return Object.values(raw.data).map((champion) => ({
    id: champion.id,
    name: champion.name,
    image: `${DDRAGON_CHAMPION_IMAGE_BASE}${champion.image.full}`,
  }));
}

function isUsableItem(item: DDragonItemEntry): boolean {
  const isOnRift = item.maps?.["11"] ?? false;
  const hasGoldCost = (item.gold?.total ?? 0) > 0;
  const isPurchasable = item.inStore !== false;
  const isChampionSpecific = Boolean(item.requiredChampion);
  const isConsumed = item.consumed ?? false;
  return isOnRift && hasGoldCost && isPurchasable && !isChampionSpecific && !isConsumed;
}

function isCompletedFullItem(item: DDragonItemEntry): boolean {
  if (!isUsableItem(item)) {
    return false;
  }
  const hasFurtherUpgrades = Boolean(item.into && item.into.length > 0);
  if (hasFurtherUpgrades) {
    return false;
  }
  const depth = item.depth ?? 0;
  return depth >= 2;
}

function mapItems(raw: DDragonDataMap<DDragonItemEntry>): Item[] {
  return Object.entries(raw.data)
    .filter(([, value]) => isUsableItem(value))
    .map(([id, item]) => ({
      id,
      name: item.name,
      image: `${DDRAGON_ITEM_IMAGE_BASE}${item.image.full}`,
    }));
}

function mapItemsFinal(raw: DDragonDataMap<DDragonItemEntry>): Item[] {
  return Object.entries(raw.data)
    .filter(([, value]) => isCompletedFullItem(value))
    .map(([id, item]) => ({
      id,
      name: item.name,
      image: `${DDRAGON_ITEM_IMAGE_BASE}${item.image.full}`,
    }));
}

function isBootsItem(item: DDragonItemEntry): boolean {
  return Boolean(item.tags?.includes("Boots"));
}

/** Boots are completed items with the Boots tag — derive from itemsFinal so ids stay aligned. */
function mapBootsFinal(itemsFinal: Item[], raw: DDragonDataMap<DDragonItemEntry>): Item[] {
  return itemsFinal.filter((item) => isBootsItem(raw.data[item.id]));
}

function mapSummonerSpells(raw: DDragonDataMap<DDragonSpellEntry>): SummonerSpell[] {
  return Object.values(raw.data)
    .filter((spell) => !SUMMONER_BLOCKLIST.has(spell.id))
    .map((spell) => ({
      id: spell.id,
      name: spell.name,
      image: `${DDRAGON_SPELL_IMAGE_BASE}${spell.image.full}`,
    }));
}

function buildDataset(): LolDataSet {
  const championsRaw = DDRAGON_CHAMPION_JSON as DDragonDataMap<DDragonChampionEntry>;
  const runesRaw = DDRAGON_RUNES_JSON as RuneTree[];
  const itemsRaw = DDRAGON_ITEMS_JSON as DDragonDataMap<DDragonItemEntry>;
  const spellsRaw = DDRAGON_SUMMONERS_JSON as DDragonDataMap<DDragonSpellEntry>;

  const itemsFinal = mapItemsFinal(itemsRaw);
  return {
    champions: mapChampions(championsRaw),
    runeTrees: runesRaw,
    items: mapItems(itemsRaw),
    itemsFinal,
    bootsFinal: mapBootsFinal(itemsFinal, itemsRaw),
    summonerSpells: mapSummonerSpells(spellsRaw),
  };
}

export function getLolData(): LolDataSet {
  // Empty [] is still an array — old caches could persist a buggy empty boots list.
  if (
    cachedData &&
    (!Array.isArray(cachedData.bootsFinal) ||
      (cachedData.bootsFinal.length === 0 && cachedData.itemsFinal.length > 0))
  ) {
    cachedData = null;
  }
  if (cachedData) {
    return cachedData;
  }
  cachedData = buildDataset();
  return cachedData;
}
