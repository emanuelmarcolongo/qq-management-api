import { Profile, Users } from '@prisma/client';

interface UserWithProfile extends Users {
  profile: Profile;
}

interface UserSignInInfo {
  id: number;
  name: string;
  username: string;
  email: string;
  profile: string;
  is_admin: boolean;
  registration: string;
}

interface PayloadUserInfo {
  sub: number;
  username: string;
  profile: string;
  is_admin: boolean;
  iat: number;
  exp: number;
}

export { PayloadUserInfo, UserSignInInfo, UserWithProfile };
