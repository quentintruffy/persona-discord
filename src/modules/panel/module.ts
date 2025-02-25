/**
 * Module de modération Pulsar.
 */
import { ButtonInteraction } from "discord.js";
import { IModule } from "../../manager/modulemanager";

const PanelModule: IModule = {
  name: "PanelModule",
  description: "Module de configuration du panel",
  version: "1.0.0",
  enabled: true,

  init(client) {
    client.on("configPanel", async (interaction: ButtonInteraction) => {
      // Code qui s'exécute quand l'événement "configPanel" est émis
      console.log("coucou");
      await interaction.reply({
        content: "Hello World!",
        ephemeral: true,
      });
    });
  },
};

export default PanelModule;
