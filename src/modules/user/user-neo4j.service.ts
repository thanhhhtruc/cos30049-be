import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { CreateUserInput, UpdateUserInput, UserDto } from './user.dto';
import { normalizeEmail } from 'validator';
import { hash } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../auth/auth.const';

@Injectable()
export class UserService {
  constructor(private readonly neo4j: Neo4jService) {}

  async getUser<T extends boolean>({
    id,
    email,
    includeCredentials,
  }: {
    id?: string;
    email?: string;
    includeCredentials?: T;
  }): Promise<
    T extends true
      ? (UserDto & { password: string; refreshToken: string | null }) | null
      : UserDto | null
  > {
    const logger = new Logger(`${this.constructor.name}:${this.getUser.name}`);

    if (!id && !email) {
      logger.error('No id or email provided');
      throw new BadRequestException();
    }

    const query = id
      ? 'MATCH (u:User {id: $id}) RETURN u'
      : 'MATCH (u:User {normalizedEmail: $normalizedEmail}) RETURN u';
    
    const params = id ? { id } : { normalizedEmail: normalizeEmail(email!) || email! };

    const result = await this.neo4j.read(query, params);
    const user = result.records[0]?.get('u').properties;

    if (!includeCredentials && user) {
      const { password, refreshToken, ...userWithoutCredentials } = user;
      return userWithoutCredentials;
    }

    return user || null;
  }

  async createUser(input: CreateUserInput): Promise<UserDto> {
    const { email, password } = input;
    const normalizedEmail = normalizeEmail(email) || email;

    // Check if user exists
    const existingUser = await this.getUser({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hash(password, BCRYPT_SALT_ROUNDS);

    const query = `
      CREATE (u:User {
        id: randomUUID(),
        email: $email,
        password: $password,
        normalizedEmail: $normalizedEmail
      })
      RETURN u
    `;

    const result = await this.neo4j.write(query, {
      ...input,
      email,
      password: hashedPassword,
      normalizedEmail,
    });

    const user = result.records[0]?.get('u').properties;
    if (!user) {
      throw new BadRequestException('User could not be created');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser({
    id,
    updates,
  }: {
    id: string;
    updates: UpdateUserInput;
  }): Promise<UserDto | null> {
    const setStatements = Object.entries(updates)
      .map(([key, value]) => `u.${key} = $${key}`)
      .join(', ');

    const query = `
      MATCH (u:User {id: $id})
      SET ${setStatements}
      RETURN u
    `;

    const result = await this.neo4j.write(query, { id, ...updates });
    const user = result.records[0]?.get('u').properties;

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }
}