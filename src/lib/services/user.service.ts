import UserModel from "../respository/user.model";
import { Logger } from "./logger.service";

export default class UserService {
  private userModel = UserModel.getInstance();
  private logger = Logger.getInstance();
}


