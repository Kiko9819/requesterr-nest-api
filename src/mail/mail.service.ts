import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService
    ) {}

    async sendUserConfirmation(user: User, token: string) {
        const domain = this.configService.get('DOMAIN');
        const port = this.configService.get('FRONTEND_PORT');
        const url = `https://${domain}:${port}/auth/confirm?token=${token}`;
        
        await this.mailerService.sendMail({
            to: user.email,
            subject: '[Requesterr] Email Confirmation',
            template: './confirmation',
            context: {
                name: user.name,
                url: url
            }
        });
    }
}
