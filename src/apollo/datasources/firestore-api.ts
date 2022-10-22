import { DataSource, DataSourceConfig } from "apollo-datasource"
import { Firestore } from "firebase-admin/firestore"

import { NexusGenObjects } from "../typegen"
import {
  accountsCollection,
  profilesCollection,
  publishesCollection,
  followsCollection,
  likesCollection,
  getDocById,
  createDoc,
  createDocWithId,
  updateDocById,
  searchDocByField,
  deleteDocById,
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

  // ===== "accounts" collection related functions ===== //

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

  // ===== "profiles" collection related functions ===== //

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

  // ===== "publishes" collection related functions ===== //

  /**
   * The function to create a publish doc in Firestore.
   * @param data see PublishToken type
   */
  async createPublishDoc(data: Partial<NexusGenObjects["PublishToken"]>) {
    return createDoc<Partial<NexusGenObjects["PublishToken"]>>({
      db: this.db,
      collectionName: publishesCollection,
      data,
    })
  }

  /**
   * The function to update a publish doc in Firestore.
   * @param docId {string} - a publish document id.
   * @param data see PublishToken type.
   */
  async updatePublishDoc(
    docId: string,
    data: Partial<NexusGenObjects["PublishToken"]>
  ) {
    return updateDocById<Partial<NexusGenObjects["PublishToken"]>>({
      db: this.db,
      collectionName: publishesCollection,
      docId,
      data,
    })
  }

  /**
   * The function to delete a publish doc
   * @param docId {string}
   */
  async deletePublishDoc(docId: string) {
    return deleteDocById({
      db: this.db,
      collectionName: publishesCollection,
      docId,
    })
  }

  /**
   * The function to search a publish doc by provied Publish token id.
   * @param publishId {number} - a Publish token id.
   * @returns {publish} - publish token
   */
  async searchPublishByTokenId(
    publishId: number
  ): Promise<{ publish: NexusGenObjects["PublishToken"] | null }> {
    const publishes = await searchDocByField<NexusGenObjects["PublishToken"]>({
      db: this.db,
      collectionName: publishesCollection,
      fieldName: "tokenId",
      fieldValue: publishId,
    })

    return { publish: publishes[0] }
  }

  // ===== "follows" collection related functions ===== //

  /**
   * The function to create a follow doc in Firestore.
   * @param data see FollowToken type
   */
  async createFollowDoc(data: Partial<NexusGenObjects["FollowToken"]>) {
    return createDoc<Partial<NexusGenObjects["FollowToken"]>>({
      db: this.db,
      collectionName: followsCollection,
      data,
    })
  }

  /**
   * The function to delete a follow doc
   * @param docId {string}
   */
  async deleteFollowDoc(docId: string) {
    return deleteDocById({
      db: this.db,
      collectionName: followsCollection,
      docId,
    })
  }

  /**
   * The function to search a follow doc by provided Follow token id.
   * @param tokenId {number} - a Follow token id.
   * @returns {follow} - follow token
   */
  async searchFollowByTokenId(
    tokenId: number
  ): Promise<{ follow: NexusGenObjects["FollowToken"] | null }> {
    const follows = await searchDocByField<NexusGenObjects["FollowToken"]>({
      db: this.db,
      collectionName: followsCollection,
      fieldName: "tokenId",
      fieldValue: tokenId,
    })

    return { follow: follows[0] }
  }

  // ===== "likes" collection related functions ===== //

  /**
   * The function to create a like doc in Firestore.
   * @param data see LikeToken type
   */
  async createLikeDoc(data: Partial<NexusGenObjects["LikeToken"]>) {
    return createDoc<Partial<NexusGenObjects["LikeToken"]>>({
      db: this.db,
      collectionName: likesCollection,
      data,
    })
  }

  /**
   * The function to delete a like doc
   * @param docId {string}
   */
  async deleteLikeDoc(docId: string) {
    return deleteDocById({
      db: this.db,
      collectionName: likesCollection,
      docId,
    })
  }

  /**
   * The function to search a like doc by provided Like token id.
   * @param tokenId {number} - a Like token id.
   * @returns {like} - like token
   */
  async searchLikeByTokenId(
    tokenId: number
  ): Promise<{ like: NexusGenObjects["LikeToken"] | null }> {
    const likes = await searchDocByField<NexusGenObjects["LikeToken"]>({
      db: this.db,
      collectionName: likesCollection,
      fieldName: "tokenId",
      fieldValue: tokenId,
    })

    return { like: likes[0] }
  }
}
