import { Events } from "discord.js";
import DiscordClient from "../client/DiscordClient";
import { IEvent } from "../manager/EventManager";

const ready: IEvent<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true, // L'événement ready ne doit être exécuté qu'une seule fois
  execute: async (client: DiscordClient) => {
    // On affiche les informations du bot

    console.log(`✓ ${client.user?.tag} est connecté !`);

    // On peut ajouter d'autres actions d'initialisation ici
    // Par exemple :
    // - Charger des données depuis une base de données
    // - Initialiser des systèmes
    // - Mettre en place des tâches planifiées
  },
};

export default ready;
