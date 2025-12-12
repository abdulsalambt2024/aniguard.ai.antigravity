import { usePosts, useDeletePost } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostDialog } from '@/components/posts/CreatePostDialog';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Posts() {
  const { data: posts, isLoading } = usePosts(50);
  const deletePost = useDeletePost();
  const { role } = useAuth();

  const canCreatePosts = role && ['member', 'admin', 'super_admin'].includes(role);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Posts</h1>
        <p className="text-muted-foreground">
          Share and discover community content
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No posts yet. {canCreatePosts && 'Be the first to create one!'}
          </p>
        </Card>
      )}

      {canCreatePosts && <CreatePostDialog />}
    </div>
  );
}
