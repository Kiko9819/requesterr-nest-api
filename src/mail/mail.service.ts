import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(user: User, token: string) {
        // todo make it environment specific
        const url = `https://example.com/auth/confirm?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: '[Requesterr] Email Confirmation',
            template: './confirmation',
            context: {
                name: user.name,
                url: url
            }
        })
    }
}
