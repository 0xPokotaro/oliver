import type { AuthService } from '@oliver/api/features/auth/service'

export type Env = {
  Variables: {
    authService: AuthService
  }
  Bindings: {}
}
