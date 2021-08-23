import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';

@Module({
  imports: [
    MailModule
  ],
  controllers: [
    UsersController
  ],
  providers: [
    ...usersProviders,
  ],
  exports: [
    ...usersProviders
  ]
})
export class UsersModule {}
