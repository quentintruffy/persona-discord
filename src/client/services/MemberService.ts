import {
  MemberSchema,
  MemberType,
} from '../../schemas/types/bases/member.schema';
import { dbService } from '../managers/databasemanager';

export class MemberService {
  public async upsertMember(memberData: MemberType): Promise<MemberType> {
    const validatedData = MemberSchema.parse(memberData);

    const { data, error } = await dbService
      .getSupabase()
      .from('members')
      .upsert(validatedData, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'upsert de la membre: ${error.message}`);
    }

    await dbService.invalidateCache(`member:${validatedData.id}`);
    await dbService.invalidateCache(`member:*`);

    return MemberSchema.parse(data);
  }

  public async getMember(memberId: string): Promise<MemberType | null> {
    return dbService.query({
      queryFn: async () => {
        const { data, error } = await dbService
          .getSupabase()
          .from('members')
          .select('*')
          .eq('id', memberId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // PGRST116 = Not found
            return null;
          }
          throw new Error(
            `Erreur lors de la récupération de la membre: ${error.message}`,
          );
        }

        return data;
      },
      schema: MemberSchema.nullable(),
      cacheKey: `member:${memberId}`,
      ttl: 3600,
    });
  }

  public async memberExists(memberId: string): Promise<boolean> {
    const member = await this.getMember(memberId);
    return member !== null;
  }

  public async getOrCreateMember(memberId: string): Promise<MemberType> {
    const member = await this.getMember(memberId);
    if (member) {
      return member;
    }

    return this.upsertMember({
      id: memberId,
    });
  }
}
