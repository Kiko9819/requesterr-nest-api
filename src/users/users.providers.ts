import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

export const usersProviders = [
    UsersService,
    {
        provide: 'USERS_REPOSITORY',
        useValue: User
    }
];
