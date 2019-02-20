import {FriendRequest} from './friend-request';

export class User {
  constructor(
    public id?: number,
    public username?: string,
    // public password?: string,
    public firstName?: string,
    public lastName?: string,
    public profileImage?: string,
    public gender?: Gender,
    public cityId?: number,
    public birthDate?: string,
    public role?: Role,
    public activated?: boolean,
    public avatarUrl?: string,
    public friends?: User[],
    public outgoingFriendRequests?: FriendRequest[],
    public incomingFriendRequests?: FriendRequest[]
  ) {
  }
}

export enum Gender {
  MALE, FEMALE
}

export enum Role {
  USER, ADMIN
}
