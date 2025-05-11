import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomInt } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, firstName, lastName, password, address, phoneNumber } =
      createUserDto;

    const accountNumber = await this.generateUniqueAccountNumber();

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      accountNumber,
      address,
      phoneNumber,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation code
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async generateUniqueAccountNumber(): Promise<string> {
    const BATCH_SIZE = 5; // how many candidates to try per round
    const MIN = 1_000_000_000; // smallest 10-digit number
    const RANGE = 9_000_000_000; // max - min + 1

    while (true) {
      // 1) Generate a small batch of random 10-digit strings
      const candidates = Array.from({ length: BATCH_SIZE }, () =>
        (MIN + randomInt(RANGE)).toString(),
      );

      // 2) Query once for any that already exist
      const existing = await this.usersRepository.find({
        where: { accountNumber: In(candidates) },
      });
      const taken = new Set(existing.map((u) => u.accountNumber));

      // 3) The first one not taken is our winner
      const available = candidates.find((n) => !taken.has(n));
      if (available) {
        return available;
      }
      // otherwise loop again with a fresh batch
    }
  }

  async findOne(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
