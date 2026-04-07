"use client";

import { GeneratorForm } from "@/components/GeneratorForm";
import { FiltersPanel } from "@/components/FiltersPanel";
import { PlayerCard } from "@/components/PlayerCard";
import { useGenerator } from "@/hooks/useGenerator";

export default function HomePage() {
  const {
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
  } = useGenerator();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Random League of Legends Generator
        </h1>
        <p className="text-zinc-400">
          Generate random champions, roles, runes, items, and summoner spells for your squad.
        </p>
      </header>

      <GeneratorForm
        playerCount={playerCount}
        playerSlots={playerSlots}
        isLoading={isLoading}
        onPlayerCountChange={(value) => setPlayerCount(Math.max(1, Math.min(5, value || 1)))}
        onPlayerSlotsChange={setPlayerSlots}
        onGenerate={() => generate(playerCount)}
      />

      {data ? (
        <FiltersPanel
          filters={filters}
          champions={data.champions}
          items={data.itemsFinal}
          summonerSpells={data.summonerSpells}
          onToggleRole={toggleRole}
          onToggleChampion={toggleChampion}
          onToggleItem={toggleItem}
          onToggleSummonerSpell={toggleSummonerSpell}
          onEnableAllRoles={setAllRolesEnabled}
          onDisableAllRoles={setAllRolesDisabled}
          onEnableAllChampions={setAllChampionsEnabled}
          onDisableAllChampions={() => setAllChampionsDisabled(data.champions.map((champion) => champion.id))}
          onEnableAllItems={setAllItemsEnabled}
          onDisableAllItems={() => setAllItemsDisabled(data.itemsFinal.map((item) => item.id))}
          onEnableAllSummoners={setAllSummonersEnabled}
          onDisableAllSummoners={() => setAllSummonersDisabled(data.summonerSpells.map((spell) => spell.id))}
        />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-600/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            index={index}
            player={player}
            onReroll={rerollPlayer}
            onCopyBuild={copyBuild}
          />
        ))}
      </section>
    </main>
  );
}
