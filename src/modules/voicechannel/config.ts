/**
 * Configuration du module VoiceChannel
 * Modifiez ces valeurs selon vos besoins
 */

export default {
  /**
   * ID du salon vocal qui sert de "lobby"
   * Quand un utilisateur rejoint ce salon, un salon privé sera créé pour lui
   * Exemple: "123456789012345678"
   */
  lobbyChannelId: "1268170175031545900",

  /**
   * ID de la catégorie où les salons privés seront créés
   * Exemple: "123456789012345678"
   */
  privateChannelCategoryId: "1216743628358287360",

  /**
   * Préfixe pour les noms des salons privés
   * Par défaut: "🔒 "
   */
  channelNamePrefix: "🔒 ",

  /**
   * Durée maximum d'un salon privé inactif en secondes
   * 0 = pas de limite de durée
   * Par défaut: 3600 (1 heure)
   */
  inactiveTimeout: 3600,

  /**
   * Limite d'utilisateurs par défaut pour les salons privés
   * 0 = pas de limite
   * Par défaut: 0
   */
  defaultUserLimit: 0,
};
