import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

export const RapportContainer = ({
  motif,
}: {
  motif: string;
}): ContainerBuilder => {
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
      new TextDisplayBuilder().setContent(`## Bannissement Pulsar - ${motif}`),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "Un utilisateur viens de recevoir une sanction pulsar pour avoir posté un message contenant des termes de discrimination contre les personnes d'origine islamophobe. \n\nL'utilisateur est actuellement en période blanche, ce qui signifie qu'il est banni uniquement du serveur sur lequel la sanction a été appliquée. Un vote communautaire est en cours concernant ce bannissement. Vous pouvez consulter le rapport complet ci-dessous.",
      ),
    )
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems([
        {
          media: {
            url: 'https://cdn.discordapp.com/attachments/697138785317814292/1364347505642569850/components-hero.png?ex=6819d1e1&is=68188061&hm=0da94022e341b08c520f51be981f3a1af936fa5f0a78e49e91a1fe2b10651403&',
          },
        },
      ]),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            'En savoir plus sur la manière dont nous stockons les données:',
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel('DGSC')
            .setURL('https://discord.gg/chBECAZQFj')
            .setStyle(ButtonStyle.Link),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "-# En telechargeant ce rapport, vous acceptez de respecter les conditions d'utilisation de Pulsar. Ce rapport est à destination des membres souhaitant participer au vote communautaire.",
      ),
    )
    .addFileComponents(new FileBuilder().setURL('attachment://rapport.txt'));
};
