import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema, UpdateUserSchema } from './user.schema';

export class UserDto {
  id: string;
  email: string;
  normalizedEmail?: string | null | undefined;
  address?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  profileImg?: string | null;
}

export class CreateUserInput extends createZodDto(CreateUserSchema) {}

export class UpdateUserInput extends createZodDto(UpdateUserSchema) {}
