import { Controller, Post, UseGuards, HttpCode, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('/log-in')
    async login(@Req() request, @Res() response) {
        const user = request.user.dataValues;

        const cookie = this.authService.getCookieWithJwtToken(user.id);
        response.setHeader('Set-Cookie', cookie);

        user.password = undefined;
        
        return response.send(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/log-out')
    async logOut(@Req() request, @Res() response) {
        response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
        return response.sendStatus(200);
    }
}