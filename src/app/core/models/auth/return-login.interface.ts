import { ReturnUserDto } from '../users/return-user.interface';

export interface ReturnLoginDto {
  user: ReturnUserDto;
  accessToken: string;
}
