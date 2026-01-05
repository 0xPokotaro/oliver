export type AuthUser = {
  id: string;
};

export type Env = {
  Variables: {
    user: AuthUser;
  };
};
