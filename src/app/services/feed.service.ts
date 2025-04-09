import {Injectable} from "@angular/core";
import {AppBskyActorDefs, AppBskyFeedDefs, AppBskyFeedPost} from '@atproto/api';
import {PostService} from '@services/post.service';
import {SignalizedFeedViewPost} from '@models/signalized-feed-view-post';
import {AuthService} from '@core/auth/auth.service';
import {GroupedPost, GroupedPostOptions} from '@models/grouped-post';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  parseFeedViewPost(feedViewPost: AppBskyFeedDefs.FeedViewPost): SignalizedFeedViewPost {
    const signalizedFeedViewPost = new SignalizedFeedViewPost();
    feedViewPost.post.record = feedViewPost.post.record as AppBskyFeedPost.Record;
    signalizedFeedViewPost.post = this.postService.setPost(feedViewPost.post);
    signalizedFeedViewPost.reply = feedViewPost.reply;
    signalizedFeedViewPost.reason = feedViewPost.reason;
    signalizedFeedViewPost.feedContext = feedViewPost.feedContext;

    return signalizedFeedViewPost;
  }

  groupFeedViewPosts(feedViewPosts: AppBskyFeedDefs.FeedViewPost[], options?: GroupedPostOptions): GroupedPost[] {
    const groupedPosts: GroupedPost[] = [];
    let feedViews = feedViewPosts;

    while (feedViews.length) {
      const group = new GroupedPost();
      const feedView = feedViews.shift();

      if (options?.hideReplies && feedView.reply) continue;
      if (options?.hideReposts && feedView.reason?.$type == 'app.bsky.feed.defs#reasonRepost') continue;

      let root: AppBskyFeedDefs.PostView;
      let parent: AppBskyFeedDefs.PostView;

      if (AppBskyFeedDefs.isPostView(feedView.reply?.root)) {
        root = feedView.reply.root;
      }
      if (AppBskyFeedDefs.isPostView(feedView.reply?.parent)) {
        parent = feedView.reply.parent;
      }

      const followedUser = (actor: AppBskyActorDefs.ProfileViewBasic) => {
        if (!actor) return false;
        if (this.authService.loggedUser().did == actor.did) return true;
        return !!actor.viewer.following;
      }

      if (options?.hideUnfollowedReplies && !followedUser(parent?.author)) continue;

      const post = this.parseFeedViewPost(feedView);
      group.thread.push(post);

      // Avoid repeated rts/pinned posts
      if (post.reason) {
        feedViews = feedViews.filter(fvp => !(fvp.post.uri == post.post().uri && fvp.reason));
      }

      // If its not pinned/rt and user follows reply targets
      if (!post.reason && followedUser(parent?.author) && followedUser(root?.author)) {
        group.thread.unshift(...[this.parseFeedViewPost({
          $type: 'app.bsky.feed.defs#feedViewPost',
          post: parent
        })]);

        // Avoid repeated posts in processed bunch
        feedViews = feedViews.filter(fvp => fvp.post.uri !== parent.uri || fvp.reason);

        // Avoid duplicating parent if it's the root
        if (parent.uri !== root.uri) {
          group.thread.unshift(...[this.parseFeedViewPost({
            $type: 'app.bsky.feed.defs#feedViewPost',
            post: root
          })]);

          feedViews = feedViews.filter(fvp => fvp.post.uri !== root.uri || fvp.reason);
        }
      }

      if (group.thread.length) groupedPosts.push(group);
    }

    return groupedPosts;
  }
}
