import { User } from "../user.type";
import { BaseRepository } from "./baseRespository.signature";

export interface UserRepository extends BaseRepository<User> {
}
