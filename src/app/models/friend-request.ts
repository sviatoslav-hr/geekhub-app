import {User} from './user';

export class FriendRequest {
  constructor(
    public sender?: User,
    public receiver?: User,
    public status?: FriendRequestStatus
  ) {

  }
}

enum FriendRequestStatus {
  PENDING, IGNORING
}
