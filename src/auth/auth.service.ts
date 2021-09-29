import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { ClientOptions, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Observable, take } from 'rxjs';

@Injectable()
export class AuthService {

    private client: ClientProxy;

    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService
    ) {
        const microservicesOptions: ClientOptions = {
            transport: Transport.REDIS,
            options: {
                url: `redis://${this.configService.get('DOMAIN')}:${this.configService.get('REDIS_PORT')}`
            }
        };
        this.client = ClientProxyFactory.create(microservicesOptions);

    }

    getCookiesForLogOut(): string[] {
        return [
            'Authentication=; HttpOnly; Path=/; Max-Age=0',
            'Refresh=; HttpOnly; Path=/; Max-Age=0'
        ];
    }

    getCookieWithJwtAccessToken(userId: number): string {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
        });
        return `Authentication=${token}; HttpOnly; Path=/;Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
    }

    getCookieWithJwtRefreshToken(userId: number): {cookie: string, token: string} {
        const payload: TokenPayload = { userId };

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

    getToken(id): Observable<any> {
        return this.client.send('get-token', id);
    }

    setToken(key, value): Observable<any> {
        return this.client.send('set-token', { key, value });
    }

    deleteToken(key): Observable<any> {
        return this.client.send('delete-token', key);
    }

    async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

        if (!isPasswordMatching) {
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
        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    async getUserIfRefreshTokenMatches(userId: number, refreshToken: string) {
        const user = await this.usersService.findOne(userId);
        
        return new Promise((resolve, reject) => {
            this.getToken(userId).pipe(
                take(1)
            ).subscribe({
                next: async (cachedToken) => {
                    const isRefreshTokenMatching = await bcrypt.compare(
                        refreshToken,
                        cachedToken
                    );
    
                    if (isRefreshTokenMatching) {
                        return resolve(user);
                    } else {
                        reject("Refresh tokens not matching");
                    }
                }
            })
        })
      }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
