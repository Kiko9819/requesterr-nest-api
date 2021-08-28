import { Controller, Post, UseGuards, HttpCode, Req, Res, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import * as bcrypt from 'bcrypt';
import { take } from 'rxjs';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
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
    @HttpCode(200)
    async logOut(@Req() request, @Res() response) {
        this.authService.deleteToken(request.user.userId).pipe(
            take(1)
        ).subscribe({
            next: () => {
                response.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
                return response.sendStatus(200);
            }
        });
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@Req() request, @Res() response) {
        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(request.user.userId);
        
        response.setHeader('Set-Cookie', accessTokenCookie);

        return response.sendStatus(200);
    }

}