import { DataSource, DataSourceConfig } from 'apollo-datasource'
import { Firestore } from 'firebase-admin/firestore'

import { NexusGenObjects } from '../typegen'
import {
  accountsCollection,
  walletsCollection,
  profilesCollection,
  getDocById,
  createDocRef,
  createDoc,
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
   * @param data - {address, profiles, type} blockchain address and profiles empty array
   * @returns
   */
  async createAccount(
    id: string,
    data: Pick<NexusGenObjects['Account'], 'address' | 'type'>
  ) {
    const { address, type } = data

    return createDocWithId<
      Pick<NexusGenObjects['Account'], 'address' | 'type'>
    >({
      db: this.db,
      collectionName: accountsCollection,
      docId: id || '',
      data: {
        address,
        type,
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

  async createProfileDoc(data: NexusGenObjects['Token']) {
    return createDoc<NexusGenObjects['Token']>({
      db: this.db,
      collectionName: profilesCollection,
      data,
    })
  }

  async updateProfileDoc({
    docId,
    data,
  }: {
    docId: string
    data: Partial<NexusGenObjects['Token']>
  }) {
    return updateDocById<Partial<NexusGenObjects['Token']>>({
      db: this.db,
      collectionName: profilesCollection,
      docId,
      data,
    })
  }
}
