import { HttpException, HttpStatus, Inject, Injectable, Res } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User,
    private mailService: MailService
  ) { }

  async getUserByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username: username } });

    if(user) {
      return user;
    }
    return null;
  }

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email: email } });

    if(user) {
      return user;
    }
    return null;
  }

  async checkIfExistsByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username: username } });

    if (user) {
      throw new HttpException('User with this username already exists', HttpStatus.CONFLICT);
    }
    return null;
  }

  async checkIfExistsByEmail(email: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email: email } });

    if (user) {
      throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
    }
    return null;
  }

  async create(@Res() res, createUserDto: CreateUserDto) {
    try {
      await this.checkIfExistsByEmail(createUserDto.email);
      await this.checkIfExistsByUsername(createUserDto.username);

      const hash = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.usersRepository.create({
        ...createUserDto,
        password: hash
      });
  
      const token = Math.floor(1000 + Math.random() * 9000).toString();
      await this.mailService.sendUserConfirmation(user, token);
  
      user.password = undefined;
      
      return res.status(HttpStatus.OK).json({
        message: "User has been created successfully",
        user
      });
    } catch(error) {
      return res.status(error.getStatus()).json({
        message: error.message
      });
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll<User>();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne<User>({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(updateUserDto, { where: { id } });
  }

  remove(id: number) {
    return this.usersRepository.destroy({where: { id }});
  }
}
