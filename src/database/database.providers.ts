import { ConfigService } from "@nestjs/config";
import { Sequelize } from "sequelize-typescript";
import { models } from "./models";

export const databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async (config: ConfigService) => 
          await (async () => {
            const sequelize = new Sequelize({
              dialect: config.get('DB_DIALECT'),
              host: config.get('DB_HOST'),
              port: config.get('DB_PORT'),
              username: config.get('DB_USERNAME'),
              password: config.get('DB_PASSWORD'),
              database: config.get('DB_NAME')
            });
            sequelize.addModels([...models]);
            await sequelize.sync();
            return sequelize;
        })(), inject: [ConfigService]
    }
]