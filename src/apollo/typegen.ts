/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./context"




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  CreateCommentInput: { // input type
    contentURI: string; // String!
    creatorId: number; // Int!
    targetId: number; // Int!
  }
  CreateProfileInput: { // input type
    handle: string; // String!
    imageURI?: string | null; // String
  }
  CreatePublishInput: { // input type
    contentURI: string; // String!
    creatorId: number; // Int!
    description: string; // String!
    imageURI: string; // String!
    metadataURI: string; // String!
    primaryCategory: NexusGenEnums['Category']; // Category!
    secondaryCategory: NexusGenEnums['Category']; // Category!
    tertiaryCategory: NexusGenEnums['Category']; // Category!
    title: string; // String!
  }
  FollowInput: { // input type
    followeeId: number; // Int!
    followerId: number; // Int!
  }
  HasRoleInput: { // input type
    role: NexusGenEnums['Role']; // Role!
  }
  UpdateCommentInput: { // input type
    contentURI: string; // String!
    creatorId: number; // Int!
    tokenId: number; // Int!
  }
  UpdateProfileImageInput: { // input type
    imageURI: string; // String!
    tokenId: number; // Int!
  }
  UpdatePublishInput: { // input type
    contentURI: string; // String!
    creatorId: number; // Int!
    description?: string | null; // String
    imageURI: string; // String!
    metadataURI: string; // String!
    primaryCategory: NexusGenEnums['Category']; // Category!
    secondaryCategory: NexusGenEnums['Category']; // Category!
    tertiaryCategory: NexusGenEnums['Category']; // Category!
    title: string; // String!
    tokenId: number; // Int!
  }
}

export interface NexusGenEnums {
  Category: "Animals" | "Children" | "Education" | "Empty" | "Entertainment" | "Food" | "Gaming" | "LifeStyle" | "Men" | "Movies" | "Music" | "News" | "NotExist" | "Other" | "Programming" | "Science" | "Sports" | "Technology" | "Travel" | "Vehicles" | "Women"
  Role: "ADMIN_ROLE" | "DEFAULT_ADMIN_ROLE" | "UPGRADER_ROLE"
  UploadType: "avatar" | "post"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  AddressResult: { // root type
    address: string; // String!
  }
  CommentToken: { // root type
    contentURI: string; // String!
    creatorId: number; // Int!
    disLikes: number; // Int!
    likes: number; // Int!
    owner: string; // String!
    targetId: number; // Int!
    tokenId: number; // Int!
  }
  CreateWalletResult: { // root type
    address: string; // String!
  }
  EstimateGasResult: { // root type
    gas: string; // String!
  }
  FeeResult: { // root type
    fee: number; // Float!
  }
  MetadataCustomProps: { // root type
    contentURI?: string | null; // String
    handle: string; // String!
    owner: string; // String!
    storagePath?: string | null; // String
    storageURL: string; // String!
    type: NexusGenEnums['UploadType']; // UploadType!
  }
  Mutation: {};
  ProfileToken: { // root type
    followers: number; // Int!
    following: number; // Int!
    handle: string; // String!
    imageURI: string; // String!
    owner: string; // String!
    tokenId: number; // Int!
  }
  PublishToken: { // root type
    contentURI: string; // String!
    creatorId: number; // Int!
    disLikes: number; // Int!
    imageURI: string; // String!
    likes: number; // Int!
    metadataURI: string; // String!
    owner: string; // String!
    tokenId: number; // Int!
  }
  Query: {};
  TokenURIResult: { // root type
    uri: string; // String!
  }
  UploadParams: { // root type
    address: string; // String!
    fileName: string; // String!
    handle: string; // String!
    mime: string; // String!
    uploadType: NexusGenEnums['UploadType']; // UploadType!
    userId: string; // String!
  }
  UploadReturnType: { // root type
    cid: string; // String!
    storagePath: string; // String!
    storageURL: string; // String!
    tokenURI: string; // String!
  }
  WriteResult: { // root type
    status: string; // String!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  AddressResult: { // field return type
    address: string; // String!
  }
  CommentToken: { // field return type
    contentURI: string; // String!
    creatorId: number; // Int!
    disLikes: number; // Int!
    likes: number; // Int!
    owner: string; // String!
    targetId: number; // Int!
    tokenId: number; // Int!
  }
  CreateWalletResult: { // field return type
    address: string; // String!
  }
  EstimateGasResult: { // field return type
    gas: string; // String!
  }
  FeeResult: { // field return type
    fee: number; // Float!
  }
  MetadataCustomProps: { // field return type
    contentURI: string | null; // String
    handle: string; // String!
    owner: string; // String!
    storagePath: string | null; // String
    storageURL: string; // String!
    type: NexusGenEnums['UploadType']; // UploadType!
  }
  Mutation: { // field return type
    createComment: NexusGenRootTypes['WriteResult']; // WriteResult!
    createProfile: NexusGenRootTypes['WriteResult']; // WriteResult!
    createPublish: NexusGenRootTypes['WriteResult']; // WriteResult!
    createWallet: NexusGenRootTypes['CreateWalletResult']; // CreateWalletResult!
    deleteComment: NexusGenRootTypes['WriteResult']; // WriteResult!
    deletePublish: NexusGenRootTypes['WriteResult']; // WriteResult!
    disLikeComment: NexusGenRootTypes['WriteResult']; // WriteResult!
    disLikePublish: NexusGenRootTypes['WriteResult']; // WriteResult!
    estimateGasCreateProfile: NexusGenRootTypes['EstimateGasResult']; // EstimateGasResult!
    estimateGasCreatePublish: NexusGenRootTypes['EstimateGasResult']; // EstimateGasResult!
    estimateGasFollow: NexusGenRootTypes['EstimateGasResult']; // EstimateGasResult!
    estimateGasLikePublish: NexusGenRootTypes['EstimateGasResult']; // EstimateGasResult!
    follow: NexusGenRootTypes['WriteResult']; // WriteResult!
    hasRoleProfile: boolean; // Boolean!
    hasRolePublish: boolean; // Boolean!
    likeComment: NexusGenRootTypes['WriteResult']; // WriteResult!
    likePublish: NexusGenRootTypes['WriteResult']; // WriteResult!
    setDefaultProfile: NexusGenRootTypes['WriteResult']; // WriteResult!
    setLikeFee: NexusGenRootTypes['WriteResult']; // WriteResult!
    setOwnerAddress: NexusGenRootTypes['WriteResult']; // WriteResult!
    setPlatformFee: NexusGenRootTypes['WriteResult']; // WriteResult!
    setProfileContract: NexusGenRootTypes['WriteResult']; // WriteResult!
    updateComment: NexusGenRootTypes['WriteResult']; // WriteResult!
    updateProfileImage: NexusGenRootTypes['WriteResult']; // WriteResult!
    updatePublish: NexusGenRootTypes['WriteResult']; // WriteResult!
    validateHandle: boolean; // Boolean!
    withdrawFunds: NexusGenRootTypes['WriteResult']; // WriteResult!
  }
  ProfileToken: { // field return type
    followers: number; // Int!
    following: number; // Int!
    handle: string; // String!
    imageURI: string; // String!
    owner: string; // String!
    tokenId: number; // Int!
  }
  PublishToken: { // field return type
    contentURI: string; // String!
    creatorId: number; // Int!
    disLikes: number; // Int!
    imageURI: string; // String!
    likes: number; // Int!
    metadataURI: string; // String!
    owner: string; // String!
    tokenId: number; // Int!
  }
  Query: { // field return type
    getComment: NexusGenRootTypes['CommentToken']; // CommentToken!
    getDefaultProfile: NexusGenRootTypes['ProfileToken'] | null; // ProfileToken
    getLikeFee: NexusGenRootTypes['FeeResult']; // FeeResult!
    getMyBalance: string; // String!
    getOwnerAddress: NexusGenRootTypes['AddressResult']; // AddressResult!
    getPlatformFee: NexusGenRootTypes['FeeResult']; // FeeResult!
    getProfileContractAddress: NexusGenRootTypes['AddressResult']; // AddressResult!
    getProfileTokenURI: NexusGenRootTypes['TokenURIResult'] | null; // TokenURIResult
    getPublish: NexusGenRootTypes['PublishToken'] | null; // PublishToken
    getPublishTokenURI: NexusGenRootTypes['TokenURIResult'] | null; // TokenURIResult
  }
  TokenURIResult: { // field return type
    uri: string; // String!
  }
  UploadParams: { // field return type
    address: string; // String!
    fileName: string; // String!
    handle: string; // String!
    mime: string; // String!
    uploadType: NexusGenEnums['UploadType']; // UploadType!
    userId: string; // String!
  }
  UploadReturnType: { // field return type
    cid: string; // String!
    storagePath: string; // String!
    storageURL: string; // String!
    tokenURI: string; // String!
  }
  WriteResult: { // field return type
    status: string; // String!
  }
}

export interface NexusGenFieldTypeNames {
  AddressResult: { // field return type name
    address: 'String'
  }
  CommentToken: { // field return type name
    contentURI: 'String'
    creatorId: 'Int'
    disLikes: 'Int'
    likes: 'Int'
    owner: 'String'
    targetId: 'Int'
    tokenId: 'Int'
  }
  CreateWalletResult: { // field return type name
    address: 'String'
  }
  EstimateGasResult: { // field return type name
    gas: 'String'
  }
  FeeResult: { // field return type name
    fee: 'Float'
  }
  MetadataCustomProps: { // field return type name
    contentURI: 'String'
    handle: 'String'
    owner: 'String'
    storagePath: 'String'
    storageURL: 'String'
    type: 'UploadType'
  }
  Mutation: { // field return type name
    createComment: 'WriteResult'
    createProfile: 'WriteResult'
    createPublish: 'WriteResult'
    createWallet: 'CreateWalletResult'
    deleteComment: 'WriteResult'
    deletePublish: 'WriteResult'
    disLikeComment: 'WriteResult'
    disLikePublish: 'WriteResult'
    estimateGasCreateProfile: 'EstimateGasResult'
    estimateGasCreatePublish: 'EstimateGasResult'
    estimateGasFollow: 'EstimateGasResult'
    estimateGasLikePublish: 'EstimateGasResult'
    follow: 'WriteResult'
    hasRoleProfile: 'Boolean'
    hasRolePublish: 'Boolean'
    likeComment: 'WriteResult'
    likePublish: 'WriteResult'
    setDefaultProfile: 'WriteResult'
    setLikeFee: 'WriteResult'
    setOwnerAddress: 'WriteResult'
    setPlatformFee: 'WriteResult'
    setProfileContract: 'WriteResult'
    updateComment: 'WriteResult'
    updateProfileImage: 'WriteResult'
    updatePublish: 'WriteResult'
    validateHandle: 'Boolean'
    withdrawFunds: 'WriteResult'
  }
  ProfileToken: { // field return type name
    followers: 'Int'
    following: 'Int'
    handle: 'String'
    imageURI: 'String'
    owner: 'String'
    tokenId: 'Int'
  }
  PublishToken: { // field return type name
    contentURI: 'String'
    creatorId: 'Int'
    disLikes: 'Int'
    imageURI: 'String'
    likes: 'Int'
    metadataURI: 'String'
    owner: 'String'
    tokenId: 'Int'
  }
  Query: { // field return type name
    getComment: 'CommentToken'
    getDefaultProfile: 'ProfileToken'
    getLikeFee: 'FeeResult'
    getMyBalance: 'String'
    getOwnerAddress: 'AddressResult'
    getPlatformFee: 'FeeResult'
    getProfileContractAddress: 'AddressResult'
    getProfileTokenURI: 'TokenURIResult'
    getPublish: 'PublishToken'
    getPublishTokenURI: 'TokenURIResult'
  }
  TokenURIResult: { // field return type name
    uri: 'String'
  }
  UploadParams: { // field return type name
    address: 'String'
    fileName: 'String'
    handle: 'String'
    mime: 'String'
    uploadType: 'UploadType'
    userId: 'String'
  }
  UploadReturnType: { // field return type name
    cid: 'String'
    storagePath: 'String'
    storageURL: 'String'
    tokenURI: 'String'
  }
  WriteResult: { // field return type name
    status: 'String'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createComment: { // args
      input: NexusGenInputs['CreateCommentInput']; // CreateCommentInput!
    }
    createProfile: { // args
      input: NexusGenInputs['CreateProfileInput']; // CreateProfileInput!
    }
    createPublish: { // args
      input: NexusGenInputs['CreatePublishInput']; // CreatePublishInput!
    }
    deleteComment: { // args
      commentId: number; // Int!
      creatorId: number; // Int!
    }
    deletePublish: { // args
      creatorId: number; // Int!
      publishId: number; // Int!
    }
    disLikeComment: { // args
      commentId: number; // Int!
      profileId: number; // Int!
    }
    disLikePublish: { // args
      profileId: number; // Int!
      publishId: number; // Int!
    }
    estimateGasCreateProfile: { // args
      input: NexusGenInputs['CreateProfileInput']; // CreateProfileInput!
    }
    estimateGasCreatePublish: { // args
      input: NexusGenInputs['CreatePublishInput']; // CreatePublishInput!
    }
    estimateGasFollow: { // args
      input: NexusGenInputs['FollowInput']; // FollowInput!
    }
    estimateGasLikePublish: { // args
      profileId: number; // Int!
      publishId: number; // Int!
    }
    follow: { // args
      input: NexusGenInputs['FollowInput']; // FollowInput!
    }
    hasRoleProfile: { // args
      data: NexusGenInputs['HasRoleInput']; // HasRoleInput!
    }
    hasRolePublish: { // args
      data: NexusGenInputs['HasRoleInput']; // HasRoleInput!
    }
    likeComment: { // args
      commentId: number; // Int!
      profileId: number; // Int!
    }
    likePublish: { // args
      profileId: number; // Int!
      publishId: number; // Int!
    }
    setDefaultProfile: { // args
      handle: string; // String!
    }
    setLikeFee: { // args
      fee: number; // Float!
    }
    setOwnerAddress: { // args
      ownerAddress: string; // String!
    }
    setPlatformFee: { // args
      fee: number; // Float!
    }
    setProfileContract: { // args
      contractAddress: string; // String!
    }
    updateComment: { // args
      input: NexusGenInputs['UpdateCommentInput']; // UpdateCommentInput!
    }
    updateProfileImage: { // args
      input: NexusGenInputs['UpdateProfileImageInput']; // UpdateProfileImageInput!
    }
    updatePublish: { // args
      input: NexusGenInputs['UpdatePublishInput']; // UpdatePublishInput!
    }
    validateHandle: { // args
      handle: string; // String!
    }
  }
  Query: {
    getComment: { // args
      commentId: number; // Int!
    }
    getMyBalance: { // args
      address: string; // String!
    }
    getProfileTokenURI: { // args
      tokenId: number; // Int!
    }
    getPublish: { // args
      publishId: number; // Int!
    }
    getPublishTokenURI: { // args
      tokenId: number; // Int!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}