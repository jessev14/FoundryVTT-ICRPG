// Import Modules
import { IcrpgActor } from "./actor/actor.js";
import { IcrpgCharacterSheet } from "./actor/character-sheet.js";
import { IcrpgCharacterSheet2E } from "./actor/character-sheet-2e.js";
import { IcrpgNpcSheet } from "./actor/npc-sheet.js";
import { IcrpgNpcSheet2E } from "./actor/npc-sheet-2e.js";
import { IcrpgItem } from "./item/item.js";
import { IcrpgItemSheet } from "./item/item-sheet.js";
import { IcrpgAbilitySheet } from "./item/ability-sheet.js";
import { IcrpgRegisterHelpers } from "./handlebars.js";
import { IcrpgUtility } from "./utility.js";
import { IcrpgActiveEffect } from "./active-effect.js";
import { IcrpgCharacterSheet2Eunlocked } from "./actor/character-sheet-2e-unlocked.js";
import { IcrpgGlobalDC } from "./apps/globalDC.js";
import {IcrpgChatMessage } from "./chatMessage.js";

Hooks.once('init', async function () {

  game.icrpg = {
    IcrpgActor,
    IcrpgItem,
    IcrpgUtility
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = IcrpgActor;
  CONFIG.Item.documentClass = IcrpgItem;
  CONFIG.ActiveEffect.documentClass = IcrpgActiveEffect;
  CONFIG.ChatMessage.documentClass = IcrpgChatMessage;

  // Preload Handlebars Templates
  await loadTemplates([
    "systems/icrpg/templates/active-effects.html"
  ]);

  game.settings.register("icrpg", "globalDC", {
    name: "",
    hint: "",
    scope: "world",
    config: false,
    type: Number,
    default: 10,
    onChange: () => game.icrpg.globalDC.render()
  });

  game.settings.register("icrpg", "globalDCposition", {
    name: "",
    hint: "",
    scope: "world",
    config: false,
    type: Object,
    default: {
      left: window.innerWidth - 200,
      top: 5
    }
  });

  game.settings.register("icrpg", "globalDCvisible", {
    name: "",
    hint: "",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
    onChange: () => game.icrpg.globalDC.render()
  });

  socket.on("system.icrpg", data => {
    if (data.action === "positionGlobalDC") {
      Object.values(ui.windows).find(w => w.id === "icrpg-globalDC").setPosition({
        left: data.position.left * (window.innerWidth - 100),
        top: data.position.top * (window.innerHeight - 100),
      });
    }
  });

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("icrpg", IcrpgCharacterSheet2E, { types: ["character"], makeDefault: true });
  Actors.registerSheet("icrpg", IcrpgCharacterSheet2Eunlocked, { types: ["character"] });
  Actors.registerSheet("icrpg", IcrpgCharacterSheet, { types: ["character"] });
  Actors.registerSheet("icrpg", IcrpgNpcSheet2E, { types: ["npc"], makeDefault: true });
  Actors.registerSheet("icrpg", IcrpgNpcSheet, { types: ["npc"] });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("icrpg", IcrpgItemSheet, { types: ["item", "weapon", "armor"], makeDefault: true });
  Items.registerSheet("icrpg", IcrpgAbilitySheet, { types: ["ability"], makeDefault: true });

  IcrpgRegisterHelpers.init();
});

Hooks.once("ready", () => {
  game.icrpg.globalDC = new IcrpgGlobalDC().render(true, { left: game.settings.get("icrpg", "globalDCposition").left, top: game.settings.get("icrpg", "globalDCposition").top, width: 200, height: 200 });
});

Hooks.on("getSceneControlButtons", controls => {
  if (!game.user.isGM) return;

  const bar = controls.find(c => c.name === "token");
  bar.tools.push({
    name: "Global DC",
    title: game.i18n.localize("ICRPG.GlobalDC"),
    icon: "fas fa-dice-d20",
    toggle: true,
    active: game.settings.get("icrpg", "globalDCvisible"),
    onClick: toggle => game.settings.set("icrpg", "globalDCvisible", toggle)
  });
});