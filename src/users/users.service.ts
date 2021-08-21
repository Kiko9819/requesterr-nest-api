import { HttpStatus, Inject, Injectable, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User
  ) { }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username: username } });

    if (user) {
      return user;
    }

    return null;
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email: email } });

    if (user) {
      return user;
    }

    return null;
  }

  async create(@Res() res, createUserDto: CreateUserDto) {
    const userEmailExists = await this.findByEmail(createUserDto.email);
    const usernameExists = await this.findByUsername(createUserDto.username);

    if (userEmailExists) {
      return res.status(HttpStatus.CONFLICT).json({
        message: "User with that email already exists"
      });
    }

    if (usernameExists) {
      return res.status(HttpStatus.CONFLICT).json({
        message: "Username is already taken"
      });
    }

    const user = await this.usersRepository.create(createUserDto);

    return res.status(HttpStatus.OK).json({
      message: "User has been created successfully",
      user
    });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll<User>();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne<User>({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
