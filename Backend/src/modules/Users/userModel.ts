export interface LineProfile {
  userId: string;
  displayName: string;
}

export interface RegisterInput {
  accessToken: string;
  ctitle: string;
  cname: string;
  csurname?: string;
  cphone: string;
  cmumId?: string;
}
