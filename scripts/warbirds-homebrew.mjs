/**
 * Warbirds — Table Homebrew
 *
 * The compendiums used to ship inside the warbirds system (up to 0.5.5) as `warbirds.homebrew-*`. They now live here as
 * `warbirds-homebrew.homebrew-*`, with the same document ids. Documents already imported into a world are unaffected;
 * the only thing that changes is the compendium half of a UUID, so on first load the GM's client rewrites any
 * `Compendium.warbirds.homebrew-…` links found in world journals, actors and items.
 */
const MODULE_ID = "warbirds-homebrew";
const OLD = "Compendium.warbirds.homebrew-";
const NEW = "Compendium.warbirds-homebrew.homebrew-";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "migrated", { scope: "world", config: false, type: String, default: "" });
});

Hooks.once("ready", async () => {
  if ( !game.user.isGM || !game.users.activeGM?.isSelf ) return;
  const done = game.settings.get(MODULE_ID, "migrated");
  const version = game.modules.get(MODULE_ID)?.version ?? "0";
  if ( done === version ) return;
  const changed = await migrateLinks();
  await game.settings.set(MODULE_ID, "migrated", version);
  if ( changed ) ui.notifications.info(`Warbirds Homebrew: updated ${changed} document(s) that linked to the old system compendiums.`);
});

/**
 * Walk a plain object and return a flattened update of every string that contained an old homebrew compendium link.
 * @param {object} data
 * @param {string} [prefix]
 * @returns {Record<string, string>}
 */
export function linkUpdates(data, prefix="") {
  const updates = {};
  for ( const [key, value] of Object.entries(data ?? {}) ) {
    const path = prefix ? `${prefix}.${key}` : key;
    if ( typeof value === "string" ) {
      if ( value.includes(OLD) ) updates[path] = value.replaceAll(OLD, NEW);
    }
    else if ( value && (typeof value === "object") && !Array.isArray(value) ) Object.assign(updates, linkUpdates(value, path));
  }
  return updates;
}

/**
 * Rewrite old links in world journals, actors (and their items) and items.
 * @returns {Promise<number>}   Documents updated.
 */
async function migrateLinks() {
  let changed = 0;
  for ( const journal of game.journal ) {
    const pages = [];
    for ( const page of journal.pages ) {
      const updates = linkUpdates({ text: { content: page.text?.content ?? "" } });
      if ( Object.keys(updates).length ) pages.push({ _id: page.id, ...updates });
    }
    if ( pages.length ) { await journal.updateEmbeddedDocuments("JournalEntryPage", pages); changed += pages.length; }
  }
  const documentUpdates = async (collection, embedded) => {
    for ( const doc of collection ) {
      const updates = linkUpdates({ system: doc.system?.toObject?.() ?? {} });
      if ( Object.keys(updates).length ) { await doc.update(updates); changed++; }
      if ( embedded ) {
        const items = [];
        for ( const item of doc.items ) {
          const u = linkUpdates({ system: item.system?.toObject?.() ?? {} });
          if ( Object.keys(u).length ) items.push({ _id: item.id, ...u });
        }
        if ( items.length ) { await doc.updateEmbeddedDocuments("Item", items); changed += items.length; }
      }
    }
  };
  await documentUpdates(game.actors, true);
  await documentUpdates(game.items, false);
  return changed;
}
