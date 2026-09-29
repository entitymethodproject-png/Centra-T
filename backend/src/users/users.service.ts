import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedDemoUser();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async create(data: { email: string; passwordHash: string; name: string }): Promise<UserEntity> {
    const user = this.userRepository.create({
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
    });
    return this.userRepository.save(user);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }

  private async seedDemoUser() {
    const demoEmail = 'elena@centrat.local';
    const existing = await this.findByEmail(demoEmail);
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);
      const demoUser = this.userRepository.create({
        id: '11111111-1111-4111-8111-111111111111',
        email: demoEmail,
        passwordHash,
        name: 'Elena Demo',
      });
      await this.userRepository.save(demoUser);
    }
  }
}
