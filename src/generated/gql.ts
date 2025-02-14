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
    "query Participants($where: Participant_filter, $first: Int, $skip: Int, $orderBy: Participant_orderBy, $orderDirection: OrderDirection) {\n  participants(\n    where: $where\n    first: $first\n    skip: $skip\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    wallet {\n      id\n    }\n    volume\n    lastPaidTimestamp\n    balance\n    stakedBalance\n    id\n  }\n}": types.ParticipantsDocument,
    "query Projects($where: Project_filter, $first: Int, $skip: Int) {\n  projects(where: $where, first: $first, skip: $skip) {\n    projectId\n    metadataUri\n    handle\n    contributorsCount\n    createdAt\n  }\n}": types.ProjectsDocument,
    "query ProjectCreateEvent($where: ProjectEvent_filter) {\n  projectEvents(where: $where, first: 1) {\n    projectCreateEvent {\n      txHash\n      timestamp\n    }\n  }\n}": types.ProjectCreateEventDocument,
    "query ProjectEvents($where: ProjectEvent_filter, $orderBy: ProjectEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  projectEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    timestamp\n    payEvent {\n      id\n      amount\n      beneficiary\n      note\n      timestamp\n      feeFromProject\n      beneficiaryTokenCount\n      from\n      txHash\n      amountUSD\n      caller\n      distributionFromProjectId\n      projectId\n      project {\n        id\n        projectId\n        handle\n      }\n    }\n    cashOutEvent {\n      id\n      timestamp\n      txHash\n      from\n      beneficiary\n      reclaimAmount\n      cashOutCount\n      metadata\n      project {\n        id\n        projectId\n        handle\n      }\n    }\n  }\n}": types.ProjectEventsDocument,
    "query StoreAutoIssuanceAmountEvents($where: StoreAutoIssuanceAmountEvent_filter, $orderBy: StoreAutoIssuanceAmountEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  storeAutoIssuanceAmountEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    revnetId\n    beneficiary\n    count\n    stageId\n    caller\n  }\n}": types.StoreAutoIssuanceAmountEventsDocument,
    "query AutoIssueEvents($where: AutoIssueEvent_filter, $orderBy: AutoIssueEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  autoIssueEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    revnetId\n    stageId\n    beneficiary\n    count\n    caller\n  }\n}": types.AutoIssueEventsDocument,
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
export function graphql(source: "query Participants($where: Participant_filter, $first: Int, $skip: Int, $orderBy: Participant_orderBy, $orderDirection: OrderDirection) {\n  participants(\n    where: $where\n    first: $first\n    skip: $skip\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    wallet {\n      id\n    }\n    volume\n    lastPaidTimestamp\n    balance\n    stakedBalance\n    id\n  }\n}"): (typeof documents)["query Participants($where: Participant_filter, $first: Int, $skip: Int, $orderBy: Participant_orderBy, $orderDirection: OrderDirection) {\n  participants(\n    where: $where\n    first: $first\n    skip: $skip\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n  ) {\n    wallet {\n      id\n    }\n    volume\n    lastPaidTimestamp\n    balance\n    stakedBalance\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Projects($where: Project_filter, $first: Int, $skip: Int) {\n  projects(where: $where, first: $first, skip: $skip) {\n    projectId\n    metadataUri\n    handle\n    contributorsCount\n    createdAt\n  }\n}"): (typeof documents)["query Projects($where: Project_filter, $first: Int, $skip: Int) {\n  projects(where: $where, first: $first, skip: $skip) {\n    projectId\n    metadataUri\n    handle\n    contributorsCount\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ProjectCreateEvent($where: ProjectEvent_filter) {\n  projectEvents(where: $where, first: 1) {\n    projectCreateEvent {\n      txHash\n      timestamp\n    }\n  }\n}"): (typeof documents)["query ProjectCreateEvent($where: ProjectEvent_filter) {\n  projectEvents(where: $where, first: 1) {\n    projectCreateEvent {\n      txHash\n      timestamp\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ProjectEvents($where: ProjectEvent_filter, $orderBy: ProjectEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  projectEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    timestamp\n    payEvent {\n      id\n      amount\n      beneficiary\n      note\n      timestamp\n      feeFromProject\n      beneficiaryTokenCount\n      from\n      txHash\n      amountUSD\n      caller\n      distributionFromProjectId\n      projectId\n      project {\n        id\n        projectId\n        handle\n      }\n    }\n    cashOutEvent {\n      id\n      timestamp\n      txHash\n      from\n      beneficiary\n      reclaimAmount\n      cashOutCount\n      metadata\n      project {\n        id\n        projectId\n        handle\n      }\n    }\n  }\n}"): (typeof documents)["query ProjectEvents($where: ProjectEvent_filter, $orderBy: ProjectEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  projectEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    timestamp\n    payEvent {\n      id\n      amount\n      beneficiary\n      note\n      timestamp\n      feeFromProject\n      beneficiaryTokenCount\n      from\n      txHash\n      amountUSD\n      caller\n      distributionFromProjectId\n      projectId\n      project {\n        id\n        projectId\n        handle\n      }\n    }\n    cashOutEvent {\n      id\n      timestamp\n      txHash\n      from\n      beneficiary\n      reclaimAmount\n      cashOutCount\n      metadata\n      project {\n        id\n        projectId\n        handle\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query StoreAutoIssuanceAmountEvents($where: StoreAutoIssuanceAmountEvent_filter, $orderBy: StoreAutoIssuanceAmountEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  storeAutoIssuanceAmountEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    revnetId\n    beneficiary\n    count\n    stageId\n    caller\n  }\n}"): (typeof documents)["query StoreAutoIssuanceAmountEvents($where: StoreAutoIssuanceAmountEvent_filter, $orderBy: StoreAutoIssuanceAmountEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  storeAutoIssuanceAmountEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    revnetId\n    beneficiary\n    count\n    stageId\n    caller\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AutoIssueEvents($where: AutoIssueEvent_filter, $orderBy: AutoIssueEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  autoIssueEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    revnetId\n    stageId\n    beneficiary\n    count\n    caller\n  }\n}"): (typeof documents)["query AutoIssueEvents($where: AutoIssueEvent_filter, $orderBy: AutoIssueEvent_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {\n  autoIssueEvents(\n    where: $where\n    orderBy: $orderBy\n    orderDirection: $orderDirection\n    first: $first\n    skip: $skip\n  ) {\n    id\n    revnetId\n    stageId\n    beneficiary\n    count\n    caller\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;