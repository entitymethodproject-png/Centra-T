import { UserResponseDto } from '../../users/dto/user-response.dto';

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
}

export interface AuthHttpResponse {
  statusCode: number;
  headers: {
    'Set-Cookie': string;
  };
  body: AuthResponseDto;
}
