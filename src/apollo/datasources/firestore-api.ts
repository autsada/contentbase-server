import { DataSource, DataSourceConfig } from 'apollo-datasource'
import { Firestore } from 'firebase-admin/firestore'

import { NexusGenObjects } from '../typegen'
import {
  accountsCollection,
  walletsCollection,
  getDocById,
  createDocRef,
  createDocWithId,
  updateDocById,
} from '../../lib'

export class FirestoreAPI extends DataSource {
  db: Firestore
  context: any

  constructor({ db }: { db: Firestore }) {
    super()
    this.db = db
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config: DataSourceConfig<any>) {
    this.context = config.context
  }

  /**
   *
   * @param accountId a Firestore document id of accounts collection
   * @returns {account}
   */
  async getAccount(
    accountId: string
  ): Promise<{ account: NexusGenObjects['Account'] | null }> {
    const account = await getDocById<NexusGenObjects['Account']>({
      db: this.db,
      collectionName: accountsCollection,
      docId: accountId,
    })

    return { account }
  }

  /**
   *
   * @param walletId a Firestore document id of wallets collection
   * @returns {wallet}
   */
  async getWallet(
    walletId: string
  ): Promise<{ wallet: NexusGenObjects['Wallet'] | null }> {
    const wallet = await getDocById<NexusGenObjects['Wallet']>({
      db: this.db,
      collectionName: walletsCollection,
      docId: walletId,
    })

    return { wallet }
  }

  async createAccountsBatch(accounts: NexusGenObjects['Account'][]) {
    const batch = this.db.batch()

    accounts.forEach((ac) => {
      const ref = createDocRef({
        db: this.db,
        collectionName: accountsCollection,
      })
      batch.set(ref, ac)
    })

    return batch.commit()
  }

  /**
   *
   * @param id - user's uid
   * @param data - {address, key} of the blockchain wallet
   * @returns
   */
  async createWallet(id: string, data: Omit<NexusGenObjects['Wallet'], 'id'>) {
    const { address, key } = data
    return createDocWithId<Partial<Omit<NexusGenObjects['Wallet'], 'id'>>>({
      db: this.db,
      collectionName: walletsCollection,
      docId: id || '',
      data: {
        address,
        key,
      },
    })
  }

  /**
   *
   * @param id - user's uid
   * @param data - {address, profiles} blockchain address and profiles empty array
   * @returns
   */
  async createAccount(
    id: string,
    data: Partial<Omit<NexusGenObjects['Account'], 'id'>>
  ) {
    const { address, profiles } = data
    return createDocWithId<Partial<Omit<NexusGenObjects['Account'], 'id'>>>({
      db: this.db,
      collectionName: accountsCollection,
      docId: id || '',
      data: {
        address,
        profiles,
      },
    })
  }

  async updateAccount({
    docId,
    data,
  }: {
    docId: string
    data: Partial<NexusGenObjects['Account']>
  }) {
    return updateDocById<Partial<NexusGenObjects['Account']>>({
      db: this.db,
      collectionName: accountsCollection,
      docId,
      data,
    })
  }
}
