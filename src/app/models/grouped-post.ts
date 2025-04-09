import * as uuid from 'uuid';
import {SignalizedFeedViewPost} from '@models/signalized-feed-view-post';

export class GroupedPost {
  uuid: string = uuid.v4();
  thread: SignalizedFeedViewPost[] = [];
}

export class GroupedPostOptions {
  hideReplies?: boolean = false;
  hideUnfollowedReplies?: boolean = false;
  hideReposts?: boolean = false;
}
