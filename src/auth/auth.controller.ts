import { Controller, Post, UseGuards, HttpCode, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Req() request, @Res() response) {
        const user = request.user.dataValues;

        const cookie = this.authService.getCookieWithJwtToken(user.id);
        response.setHeader('Set-Cookie', cookie);

        user.password = undefined;
        
        return response.send(user);
    }
}