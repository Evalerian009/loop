/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_comments from "../functions/comments.js";
import type * as functions_documents from "../functions/documents.js";
import type * as functions_migrateAddColor from "../functions/migrateAddColor.js";
import type * as functions_notifications from "../functions/notifications.js";
import type * as functions_permissions from "../functions/permissions.js";
import type * as functions_resolveUserId from "../functions/resolveUserId.js";
import type * as functions_updateTitle from "../functions/updateTitle.js";
import type * as functions_users from "../functions/users.js";
import type * as functions_versions from "../functions/versions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/comments": typeof functions_comments;
  "functions/documents": typeof functions_documents;
  "functions/migrateAddColor": typeof functions_migrateAddColor;
  "functions/notifications": typeof functions_notifications;
  "functions/permissions": typeof functions_permissions;
  "functions/resolveUserId": typeof functions_resolveUserId;
  "functions/updateTitle": typeof functions_updateTitle;
  "functions/users": typeof functions_users;
  "functions/versions": typeof functions_versions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
