import { User } from "src/users/entities/user.entity";

export default interface RequestWithUser extends Request {
    user: User;
}
