import {AppBskyActorDefs, AppBskyFeedDefs, AppBskyNotificationListNotifications} from "@atproto/api";
import * as uuid from "uuid";
import {WritableSignal} from '@angular/core';

export class Notification {
  /** Notification list object */
  notification: AppBskyNotificationListNotifications.Notification;
  /** Notification reason */
  reason: "like" | "repost" | "follow" | "mention" | "reply" | "quote" | "starterpack-joined" | string;
  /** Authors' profile */
  authors: AppBskyActorDefs.ProfileView[] = [];
  /** Record URI */
  uri?: string;
  /** Record */
  post?: WritableSignal<AppBskyFeedDefs.PostView>;
  /** Uuid */
  uuid: string = uuid.v4();
}
