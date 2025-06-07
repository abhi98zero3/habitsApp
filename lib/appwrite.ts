import { Client, Account, Databases, ID } from "react-native-appwrite";
import conf from "./conf";

export class AuthService {
  client = new Client();
  account: any;
  databases : any;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteEndpoint)
      .setProject(conf.appwriteProjectID);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  signUp = async ({
    email,
    passwd,
    confPasswd,
  }: {
    email: string;
    passwd: string;
    confPasswd: string;
  }) => {
    
    if (passwd === confPasswd) {
      try {
        const usrAcc = await this.account.create(ID.unique(), email, passwd, email);
        if (usrAcc) {
           await this.login({email, passwd});
           return null;
        }
      } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }
        return "An error occured during SignUp";
      }
    } else {
        return "Passwords do not match"
    }
  };

  login = async ({email, passwd} : {email : string, passwd : string}) => {
    try {
        await this.account.createEmailPasswordSession(email, passwd);
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        }
        return "Error occured during login";
    }
  }

  signOut = () => {
    return this.account.deleteSession("current");
  }

}
export interface RealtimeResponse {
  events : string[];
  payload : any;
}

const Auth = new AuthService();
export default Auth;