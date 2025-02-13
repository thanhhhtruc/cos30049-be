import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from 'src/modules/auth/auth.const';
import { normalizeEmail } from 'validator';
import { Neo4jService } from '../../modules/neo4j/neo4j.service';

const getDummyUser = async () => {
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

export const seedUsers = async (neo4jService: Neo4jService, count: number = 10) => {
  console.log(`👤 Seeding ${count} users...`);

  for (let i = 0; i < count; i++) {
    const user = await getDummyUser();
    const normalizedEmail = normalizeEmail(user.email) || user.email;

    await neo4jService.write(`
      MERGE (u:User {normalizedEmail: $normalizedEmail})
      ON CREATE SET
        u.email = $email,
        u.password = $password,
        u.firstName = $firstName,
        u.lastName = $lastName,
        u.address = $address,
        u.phone = $phone,
        u.profileImg = $profileImg,
        u.id = randomUUID()
    `, {
      ...user,
      normalizedEmail
    });
  }
  console.log('👤 Users seeded!');
};