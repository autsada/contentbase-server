declare module "http" {
  interface IncomingMessage {
    rawBody?: string
  }
}

export type Environment = "production" | "development" | "staging"

// export type SignInMethod = 'Phone' | 'Email' | 'Google' | 'Wallet'

/**
 * Input data required for creating a Profile NFT.
 * @param key {string} - wallet's key
 * @param data.handle {string} - a handle of the profile
 * @param data.imageURI {string} - a profile image uri
 * @param data.tokenURI {string} - a token's metadata uri
 */
export interface CreateProfileInput {
  key: string
  data: {
    handle: string
    imageURI: string
    tokenURI: string
  }
}

/**
 * Input data required for creating update Profile image.
 * @param key {string} - wallet's key
 * @param data.tokenId {number} - an id of a Profile NFT
 * @param data.imageURI {string} - a profile image uri
 * @param data.tokenURI {string} - a token's metadata uri
 */
export interface UpdateProfileImageInput {
  key: string
  data: {
    tokenId: number
    imageURI: string
    tokenURI: string
  }
}
