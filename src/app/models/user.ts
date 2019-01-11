export class User {
  constructor(
    public id?: number,
    public username?: string,
    public password?: string,
    public firstName?: string,
    public lastName?: string,
    public gender?: Gender,
    public cityId?: number,
    public birthDate?: string,
    public role?: Role,
    public activated?: boolean
  ) {
  }
}

export enum Gender {
  MALE, FEMALE
}

export enum Role {
  USER, ADMIN
}
