import { Controller, Post, UseGuards, HttpCode, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import RequestWithUser from './interfaces/request-with-user.interface';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Req() request: RequestWithUser, @Res() response) {
        const {user} = request;
        
        const cookie = this.authService.getCookieWithJwtToken(user.id);
        response.setHeader('Set-Cookie', cookie);

        user.password = undefined;
        
        // todo make this return only the needed data...
        return response.send(user);
    }
}