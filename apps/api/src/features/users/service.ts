import { UserRepository } from '@oliver/api/domain/repositories/user.repository'
import { SessionKeyRepository } from '@oliver/api/domain/repositories/session-key.repository'
import { generateWalletKeyPair } from '@oliver/api/shared/utils/wallet'
import { encrypt } from '@oliver/api/shared/utils/encryption'

export interface CreateSmartAccountResponse {
  id: string
  privyUserId: string
  walletAddress: string
  smartAccountAddress: string
}

export const createSmartAccount = async (
  userId: string,
  userRepository: UserRepository,
  sessionKeyRepository: SessionKeyRepository
): Promise<CreateSmartAccountResponse> => {
  // 1. 秘密鍵を生成
  const { privateKey, address } = generateWalletKeyPair()

  // 2. 秘密鍵を暗号化
  const { iv, content } = encrypt(privateKey)

  // 3. SessionKeyテーブルに保存
  await sessionKeyRepository.create({
    userId,
    encryptedPrivateKeyIv: iv,
    encryptedPrivateKeyContent: content,
    sessionKeyAddress: address,
  })

  // 4. UserテーブルのsmartAccountAddressを更新
  const user = await userRepository.updateSmartAccountAddress(userId, address)

  // 5. レスポンス形式を返却
  return {
    id: user.id,
    privyUserId: user.privyUserId,
    walletAddress: user.walletAddress,
    smartAccountAddress: address,
  }
}
