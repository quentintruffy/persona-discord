import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  User,
} from 'discord.js';

export const MessageTicketContainer = ({
  message,
  author,
}: {
  message: string;
  author: User;
}): ContainerBuilder => {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### Message de <@${author.id}>`),
    )
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(message))
    .addSeparatorComponents(new SeparatorBuilder())
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            'Clore le ticket et demande la fermeture.',
          ),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel('Demander la fermeture')
            .setCustomId('[ticket]:request_close')
            .setStyle(ButtonStyle.Danger),
        ),
    );
};
