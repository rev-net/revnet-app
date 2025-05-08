/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query ActivityEvents($where: activityEventFilter, $orderBy: String, $orderDirection: String) {\n  activityEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    limit: 1000\n  ) {\n    items {\n      id\n      chainId\n      timestamp\n      payEvent {\n        id\n        amount\n        beneficiary\n        memo\n        timestamp\n        feeFromProject\n        newlyIssuedTokenCount\n        from\n        txHash\n        amountUsd\n        caller\n        distributionFromProjectId\n        projectId\n        project {\n          id\n          projectId\n          handle\n        }\n      }\n      cashOutTokensEvent {\n        id\n        timestamp\n        txHash\n        from\n        beneficiary\n        reclaimAmount\n        cashOutCount\n        metadata\n        project {\n          id\n          projectId\n          handle\n        }\n      }\n    }\n  }\n}": types.ActivityEventsDocument,
    "query Participants($where: participantFilter, $orderBy: String, $orderDirection: String) {\n  participants(where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {\n    totalCount\n    items {\n      chainId\n      address\n      volume\n      lastPaidTimestamp\n      balance\n      erc20Balance\n      creditBalance\n    }\n  }\n}": types.ParticipantsDocument,
    "query Project($projectId: Float!, $chainId: Float!) {\n  project(projectId: $projectId, chainId: $chainId) {\n    projectId\n    metadataUri\n    handle\n    createdAt\n    suckerGroupId\n  }\n}\n\nquery Projects($where: projectFilter) {\n  projects(where: $where) {\n    items {\n      projectId\n      metadataUri\n      handle\n      createdAt\n      suckerGroupId\n      participants {\n        totalCount\n      }\n    }\n  }\n}": types.ProjectDocument,
    "query ProjectCreateEvent($where: projectCreateEventFilter) {\n  projectCreateEvents(where: $where, limit: 1) {\n    items {\n      txHash\n      timestamp\n    }\n  }\n}": types.ProjectCreateEventDocument,
    "query StoreAutoIssuanceAmountEvents($where: storeAutoIssuanceAmountEventFilter, $orderBy: String, $orderDirection: String) {\n  storeAutoIssuanceAmountEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    items {\n      id\n      projectId\n      beneficiary\n      count\n      stageId\n      caller\n    }\n  }\n}": types.StoreAutoIssuanceAmountEventsDocument,
    "query AutoIssueEvents($where: autoIssueEventFilter, $orderBy: String, $orderDirection: String) {\n  autoIssueEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    items {\n      id\n      projectId\n      stageId\n      beneficiary\n      count\n      caller\n    }\n  }\n}": types.AutoIssueEventsDocument,
    "query SuckerGroup($id: String!) {\n  suckerGroup(id: $id) {\n    id\n    tokenSupply\n  }\n}": types.SuckerGroupDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ActivityEvents($where: activityEventFilter, $orderBy: String, $orderDirection: String) {\n  activityEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    limit: 1000\n  ) {\n    items {\n      id\n      chainId\n      timestamp\n      payEvent {\n        id\n        amount\n        beneficiary\n        memo\n        timestamp\n        feeFromProject\n        newlyIssuedTokenCount\n        from\n        txHash\n        amountUsd\n        caller\n        distributionFromProjectId\n        projectId\n        project {\n          id\n          projectId\n          handle\n        }\n      }\n      cashOutTokensEvent {\n        id\n        timestamp\n        txHash\n        from\n        beneficiary\n        reclaimAmount\n        cashOutCount\n        metadata\n        project {\n          id\n          projectId\n          handle\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query ActivityEvents($where: activityEventFilter, $orderBy: String, $orderDirection: String) {\n  activityEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    limit: 1000\n  ) {\n    items {\n      id\n      chainId\n      timestamp\n      payEvent {\n        id\n        amount\n        beneficiary\n        memo\n        timestamp\n        feeFromProject\n        newlyIssuedTokenCount\n        from\n        txHash\n        amountUsd\n        caller\n        distributionFromProjectId\n        projectId\n        project {\n          id\n          projectId\n          handle\n        }\n      }\n      cashOutTokensEvent {\n        id\n        timestamp\n        txHash\n        from\n        beneficiary\n        reclaimAmount\n        cashOutCount\n        metadata\n        project {\n          id\n          projectId\n          handle\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Participants($where: participantFilter, $orderBy: String, $orderDirection: String) {\n  participants(where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {\n    totalCount\n    items {\n      chainId\n      address\n      volume\n      lastPaidTimestamp\n      balance\n      erc20Balance\n      creditBalance\n    }\n  }\n}"): (typeof documents)["query Participants($where: participantFilter, $orderBy: String, $orderDirection: String) {\n  participants(where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {\n    totalCount\n    items {\n      chainId\n      address\n      volume\n      lastPaidTimestamp\n      balance\n      erc20Balance\n      creditBalance\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Project($projectId: Float!, $chainId: Float!) {\n  project(projectId: $projectId, chainId: $chainId) {\n    projectId\n    metadataUri\n    handle\n    createdAt\n    suckerGroupId\n  }\n}\n\nquery Projects($where: projectFilter) {\n  projects(where: $where) {\n    items {\n      projectId\n      metadataUri\n      handle\n      createdAt\n      suckerGroupId\n      participants {\n        totalCount\n      }\n    }\n  }\n}"): (typeof documents)["query Project($projectId: Float!, $chainId: Float!) {\n  project(projectId: $projectId, chainId: $chainId) {\n    projectId\n    metadataUri\n    handle\n    createdAt\n    suckerGroupId\n  }\n}\n\nquery Projects($where: projectFilter) {\n  projects(where: $where) {\n    items {\n      projectId\n      metadataUri\n      handle\n      createdAt\n      suckerGroupId\n      participants {\n        totalCount\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ProjectCreateEvent($where: projectCreateEventFilter) {\n  projectCreateEvents(where: $where, limit: 1) {\n    items {\n      txHash\n      timestamp\n    }\n  }\n}"): (typeof documents)["query ProjectCreateEvent($where: projectCreateEventFilter) {\n  projectCreateEvents(where: $where, limit: 1) {\n    items {\n      txHash\n      timestamp\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query StoreAutoIssuanceAmountEvents($where: storeAutoIssuanceAmountEventFilter, $orderBy: String, $orderDirection: String) {\n  storeAutoIssuanceAmountEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    items {\n      id\n      projectId\n      beneficiary\n      count\n      stageId\n      caller\n    }\n  }\n}"): (typeof documents)["query StoreAutoIssuanceAmountEvents($where: storeAutoIssuanceAmountEventFilter, $orderBy: String, $orderDirection: String) {\n  storeAutoIssuanceAmountEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    items {\n      id\n      projectId\n      beneficiary\n      count\n      stageId\n      caller\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AutoIssueEvents($where: autoIssueEventFilter, $orderBy: String, $orderDirection: String) {\n  autoIssueEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    items {\n      id\n      projectId\n      stageId\n      beneficiary\n      count\n      caller\n    }\n  }\n}"): (typeof documents)["query AutoIssueEvents($where: autoIssueEventFilter, $orderBy: String, $orderDirection: String) {\n  autoIssueEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    items {\n      id\n      projectId\n      stageId\n      beneficiary\n      count\n      caller\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SuckerGroup($id: String!) {\n  suckerGroup(id: $id) {\n    id\n    tokenSupply\n  }\n}"): (typeof documents)["query SuckerGroup($id: String!) {\n  suckerGroup(id: $id) {\n    id\n    tokenSupply\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;