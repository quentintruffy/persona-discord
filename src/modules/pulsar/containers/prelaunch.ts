import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

export const PreLaunchContainer = ({
  url,
}: {
  url: string;
}): ContainerBuilder => {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## Demande de bannissement pulsar'),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Une demande de bannissement pulsar vient d'être reçue. Veuillez cliquer sur le bouton ci-dessous pour lancer le processus de bannissement.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Lancer le bannissement pulsar'),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel('Lancer le bannissement')
            .setStyle(ButtonStyle.Link)
            .setURL(url),
        ),
    );
};
