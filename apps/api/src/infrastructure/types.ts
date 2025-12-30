import type { AuthService } from '@oliver/api/features/auth/service'
import type { PrivyJWTPayload } from '@oliver/api/features/auth/types'
import type { UserEntity } from '@oliver/api/domain/entities/user.entity'

export type Env = {
  Variables: {
    authService: AuthService
    jwtPayload: PrivyJWTPayload
    user: UserEntity
  }
  Bindings: {}
}
