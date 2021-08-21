import { Table, Model, Column, DataType, AllowNull } from "sequelize-typescript";

@Table
export class User extends Model {

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column({unique: true})
    username: string;

    @AllowNull(false)
    @Column({unique: true})
    email: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password: string
}
