declare module 'http' {
  interface IncomingMessage {
    rawBody?: string
  }
}

export type Environment = 'production' | 'development' | 'staging'

export type EnvConfig = {
  ssl: boolean
  port: number
  hostname: string
}

export enum AccountCode {
  SERVICE_ACCOUNT = 'SERVICE_ACCOUNT',
  CUSTOMER_ACCOUNT = 'CUSTOMER_ACCOUNT',
}

export type SignInMethod = 'Phone' | 'Email' | 'Google' | 'Wallet'

// export type CheckUserArgsType = {
//   signInMethod: SignInMethod
//   identifier?: string
//   uid?: string
// }
