import e from '@dbschema/edgeql-js';
import { CreateUserInput, UserDto } from 'src/modules/user/user.dto';
import { faker } from '@faker-js/faker';
import { client } from './seeder';
import { hash } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from 'src/modules/auth/auth.const';
import { map, mapSeries } from 'bluebird';
import { normalizeEmail } from 'validator';

const getDummyUser = async (): Promise<Required<CreateUserInput>> => {
  return {
    email: faker.internet.email(),
    password: await hash('password', BCRYPT_SALT_ROUNDS),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    profileImg: faker.image.avatar(),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const seedUsers = async (count: number = 10): Promise<UserDto[]> => {
  console.log(`👤 Seeding ${count} users...`);

  const queries = await map(Array.from({ length: count }), async () => {
    const user = await getDummyUser();
    const insertUserQuery = e
      .insert(e.User, {
        ...user,
        normalizedEmail: normalizeEmail(user.email) || user.email,
      })
      // If another user with the same normalize email already exists, return null
      .unlessConflict((user) => ({
        on: user.normalizedEmail,
      }));

    return e
      .select(insertUserQuery, () => ({
        ...e.User['*'],
        password: false,
      }))
      .toEdgeQL();
  });

  const result = await client.transaction(async (tx) => {
    return await mapSeries(queries, async (query) => {
      const queriedUser = await tx.querySingle(query);
      return queriedUser as UserDto;
    });
  });

  console.log('👤 Users seeded!');
  return result;
};
