import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

export const ResumeTicketContainer = (): ContainerBuilder => {
  return new ContainerBuilder()
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
      new TextDisplayBuilder().setContent('## Nouveau ticket !'),
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
            'Si le soucis est resolu, demandez ca fermeture.',
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel('Demander la fermeture')
            .setCustomId('[ticket]:request_close')
            .setStyle(ButtonStyle.Success),
        ),
    );
};
