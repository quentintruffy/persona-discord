import {
  PulsarPunishmentSchema,
  PulsarPunishmentType,
} from '../../schemas/types/bases/pulsarpunishments.schemas';
import { dbService } from '../managers/databasemanager';

export class PulsarPunishmentService {
  /**
   * Crée ou met à jour une pulsar punishment dans la base de données
   * @param memberId ID du membre
   * @param reason Raison du bannissement
   * @returns La pulsar punishment
   */
  public async upsertPulsarPunishment(
    memberId: string,
    reason: string,
  ): Promise<PulsarPunishmentType> {
    // const validatedData = MemberSchema.parse(memberId);

    const { data, error } = await dbService
      .getSupabase()
      .from('pulsar_punishments')
      .upsert({
        user_id: memberId,
        reason: reason,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(
        `Erreur lors de l'upsert de la pulsar punishment: ${error.message}`,
      );
    }

    await dbService.invalidateCache(`pulsar_punishment:${memberId}`);
    await dbService.invalidateCache(`pulsar_punishment:*`);

    return PulsarPunishmentSchema.parse(data);
  }

  /**
   * Récupère une pulsar punishment par son ID
   * @param memberId ID du membre
   * @returns La pulsar punishment ou null si pas trouvée
   */
  public async getPulsarPunishment(
    memberId: string,
  ): Promise<PulsarPunishmentType | null> {
    return dbService.query({
      queryFn: async () => {
        const { data, error } = await dbService
          .getSupabase()
          .from('pulsar_punishments')
          .select('*')
          .eq('user_id', memberId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Pas de config trouvée, retourner null
            console.log(error);
            return null;
          }
          throw new Error(
            `Erreur lors de la récupération de la pulsar punishment: ${error.message}`,
          );
        }

        return data;
      },
      schema: PulsarPunishmentSchema.nullable(),
      cacheKey: `pulsar_punishment:${memberId}`,
      ttl: 60 * 60,
    });
  }

  public async removePulsarPunishment(memberId: string): Promise<boolean> {
    const pulsarPunishment = await this.getPulsarPunishment(memberId);
    if (!pulsarPunishment) {
      console.warn(`Pulsar punishment non trouvé pour ${memberId}`);
      return false;
    }

    await dbService
      .getSupabase()
      .from('pulsar_punishments')
      .delete()
      .eq('user_id', memberId);

    await dbService.invalidateCache(`pulsar_punishment:${memberId}`);
    return true;
  }
}
