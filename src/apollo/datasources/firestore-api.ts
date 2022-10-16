import { DataSource, DataSourceConfig } from "apollo-datasource"
import { Firestore } from "firebase-admin/firestore"

import { NexusGenObjects } from "../typegen"
import {
  accountsCollection,
  walletsCollection,
  profilesCollection,
  publishesCollection,
  followsCollection,
  likesCollection,
  getDocById,
  createDocRef,
  createDoc,
  createDocWithId,
  updateDocById,
  searchDocByField,
} from "../../lib"

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
   * The function to get an account doc.
   * @param accountId {string} - a Firestore document id of the accounts collection which is an auth uid.
   * @returns {account}
   */
  async getAccount(
    accountId: string
  ): Promise<{ account: NexusGenObjects["Account"] | null }> {
    const account = await getDocById<NexusGenObjects["Account"]>({
      db: this.db,
      collectionName: accountsCollection,
      docId: accountId,
    })

    return { account }
  }

  /**
   * The function to create an account doc in Firestore.
   * @param id {string} - user's auth uid.
   * @param data - {address, type}
   * @returns
   */
  async createAccount(id: string, data: Partial<NexusGenObjects["Account"]>) {
    const { address, type } = data

    return createDocWithId<Partial<NexusGenObjects["Account"]>>({
      db: this.db,
      collectionName: accountsCollection,
      docId: id || "",
      data: {
        address,
        type,
      },
    })
  }

  /**
   * The function to update an account doc in Firestore.
   * @param input.docId {string} - user's auth uid.
   * @param input.data - {address, type}
   * @returns
   */
  async updateAccount({
    docId,
    data,
  }: {
    docId: string
    data: Partial<NexusGenObjects["Account"]>
  }) {
    return updateDocById<Partial<NexusGenObjects["Account"]>>({
      db: this.db,
      collectionName: accountsCollection,
      docId,
      data,
    })
  }

  /**
   * The function to create a profile doc in Firestore.
   * @param data see ProfileToken type
   */
  async createProfileDoc(data: Partial<NexusGenObjects["ProfileToken"]>) {
    return createDoc<Partial<NexusGenObjects["ProfileToken"]>>({
      db: this.db,
      collectionName: profilesCollection,
      data,
    })
  }

  /**
   * The function to update a profile doc in Firestore.
   * @param docId {string} - a profile document id.
   * @param data see ProfileToken type.
   */
  async updateProfileDoc(
    docId: string,
    data: Partial<NexusGenObjects["ProfileToken"]>
  ) {
    return updateDocById<Partial<NexusGenObjects["ProfileToken"]>>({
      db: this.db,
      collectionName: profilesCollection,
      docId,
      data,
    })
  }

  /**
   * The function to search a profile doc by provied Profile token id.
   * @param profileId {number} - a Profile token id.
   * @returns {profile} - profile token
   */
  async searchProfileByTokenId(
    profileId: number
  ): Promise<{ profile: NexusGenObjects["ProfileToken"] | null }> {
    const profiles = await searchDocByField<NexusGenObjects["ProfileToken"]>({
      db: this.db,
      collectionName: profilesCollection,
      fieldName: "tokenId",
      fieldValue: profileId,
    })

    return { profile: profiles[0] }
  }

  async createTokenDoc<T extends Record<string, any>>({
    collectionName,
    data,
  }: {
    collectionName: string
    data: T
  }) {
    return createDoc<T>({
      db: this.db,
      collectionName,
      data,
    })
  }

  async updateTokenDoc<T extends Record<string, any>>({
    collectionName,
    docId,
    data,
  }: {
    collectionName: string
    docId: string
    data: Partial<T>
  }) {
    return updateDocById<Partial<T>>({
      db: this.db,
      collectionName,
      docId,
      data,
    })
  }
}
