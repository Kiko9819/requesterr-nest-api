import { Controller, Post, UseGuards, HttpCode, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import * as bcrypt from 'bcrypt';
import { take } from 'rxjs';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('/log-in')
    async login(@Req() request, @Res() response) {
        const user = request.user.dataValues;

        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(user.id);
        const refreshTokenObject = this.authService.getCookieWithJwtRefreshToken(user.id);
        const refreshTokenCookie = refreshTokenObject.cookie;
        const refreshToken = refreshTokenObject.token;

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        this.authService.setToken(user.id, hashedRefreshToken).pipe(
            take(1)
        ).subscribe({
            next: () => {
                response.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

                user.password = undefined;
        
                return response.send(user);
            }
        });
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('/log-out')
    async logOut(@Req() request, @Res() response) {
        this.authService.deleteToken(request.user.userId).pipe(
            take(1)
        ).subscribe({
            next: () => {
                response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
                return response.sendStatus(200);
            }
        });
    }
}