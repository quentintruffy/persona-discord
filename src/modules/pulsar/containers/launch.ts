import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

export const LaunchContainer = ({
  is_active = false,
  url = '',
}: {
  is_active?: boolean;
  url?: string;
}): ContainerBuilder => {
  const container = new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems([
        {
          media: {
            url: 'https://media.discordapp.net/attachments/697138785317814292/1364347504702914602/docs-header.png?ex=6819d1e1&is=68188061&hm=a94bb6cec38db9e0b4020ab4e935d9b57063bed60eb66a53d846c63b5ba769a2&=&format=webp&quality=lossless',
          },
        },
      ]),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "## Lancement d'un bannissement pulsar",
      ),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Le lancement d'un bannissement pulsar vous engage, en cas de fausses déclarations répétées, vous pouvez être interdit de bannissements Pulsar. \n\nUne fois la demande envoyer, le systeme vas lancer un vote communauter sur le discord persona, la communauter aura un temps definie pour decider si le bannisement est legitime ou non.",
      ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            is_active
              ? '✅  Le bannissement est actuellement activé. Vous pouvez procéder au lancement.'
              : "❌  Le bannissement n'est pas activé. Veuillez l'activer pour continuer.",
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel(is_active ? 'Désactiver' : 'Activer')
            .setCustomId(!is_active ? '[pulsar]:launch' : '[pulsar]:stop')
            .setStyle(is_active ? ButtonStyle.Danger : ButtonStyle.Success),
        ),
    );

  if (is_active) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Voir le vote en cours'),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel('Vote')
            .setStyle(ButtonStyle.Link)
            .setURL(url),
        ),
    );
  }

  return container;
};
