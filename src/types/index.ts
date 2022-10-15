declare module "http" {
  interface IncomingMessage {
    rawBody?: string
  }
}

export type Environment = "production" | "development" | "staging"

// export type SignInMethod = 'Phone' | 'Email' | 'Google' | 'Wallet'
