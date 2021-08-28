import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService
    ) { }

    getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }

    getCookieWithJwtToken(userId: number) {
        const payload: TokenPayload = {userId};
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
        });
        return `Authentication=${token}; HttpOnly; Path=/;Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
    }

    getCookieWithJwtRefreshToken(userId: number) {
        const payload: TokenPayload = {userId};

        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
        });

        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;

        return {
            cookie,
            token
        };
    }

    async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

        if(!isPasswordMatching) {
            throw new UnauthorizedException();
        }
    }

    async getAuthenticatedUser(username: string, pass: string): Promise<any> {
        try {
            const user = await this.usersService.getUserByUsername(username);
            const isPasswordMatching = this.verifyPassword(pass, user.password);
    
            if (user && isPasswordMatching) {
                const { password, ...restOfUser } = user;

                return restOfUser;
            }
        } catch(error) {
            throw new UnauthorizedException();
        }
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
