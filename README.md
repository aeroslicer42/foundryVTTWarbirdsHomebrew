# Warbirds — Table Homebrew

Companion module for the **Warbirds — Jet Age** Foundry VTT system. It holds the table's own compendiums
(Aircraft, Weapons, Gear, Traits, Manoeuvres and Rules — all "(Homebrew)") so that updating the system never
overwrites edits made to them.

Install the `warbirds` system first, then this module, and enable the module in the world. The compendiums appear
in a "Warbirds (Homebrew)" folder. Worlds that used the 0.5.x system-bundled packs keep working: the document ids
are unchanged, and on first load the module rewrites any links to the old compendium names.

The content is generated from the table's Roll20 handouts and crunch document by `packs-src/homebrew.py` in the
system's development folder.

## Install from GitHub

In Foundry's *Install Module* dialog, paste this into **Manifest URL**:

```
https://github.com/aeroslicer42/foundryVTTWarbirdsHomebrew/releases/latest/download/module.json
```

The system must be installed too (*Install System* with
`https://github.com/aeroslicer42/foundryVTTWarbirds/releases/latest/download/system.json`).
