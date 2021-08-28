import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { TokenPayload } from "../interfaces/token-payload.interface";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Refresh;
                }
            ]),
            secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true
        })
    }

    async validate(request: Request, payload: TokenPayload) {
        const refreshToken = request.cookies?.Refresh;
        const user = await this.authService.getUserIfRefreshTokenMatches(payload.userId, refreshToken);
        return {userId: user['dataValues'].id};
    }
}