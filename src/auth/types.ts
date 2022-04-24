export interface DecodedUser {
  iss: string;
  sub: string;
  aud: Array<string>;
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}
