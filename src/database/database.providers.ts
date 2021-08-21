import { Sequelize } from "sequelize-typescript";
import { models } from "./models";

export const databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            const sequelize = new Sequelize({
              dialect: 'mysql',
              host: 'localhost',
              port: 3306,
              username: 'root',
              password: 'example',
              database: 'example',
            });
            sequelize.addModels([...models]);
            await sequelize.sync();
            return sequelize;
          },
    }
]