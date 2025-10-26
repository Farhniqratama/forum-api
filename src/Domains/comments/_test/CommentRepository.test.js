const CommentRepository = require('../CommentRepository');

describe('CommentRepository abstract class', () => {
  /**
   * The CommentRepository defines a set of methods that must be
   * implemented by concrete repository implementations. Each method
   * throws a specific error to signal that the method is abstract.
   * These unit tests ensure that calling any of the abstract methods
   * without providing an implementation will result in the expected
   * error being thrown. This is important so that developers are
   * immediately aware of missing implementations when they extend
   * CommentRepository.
   */
  it('should throw when invoking abstract methods', async () => {
    const commentRepository = new CommentRepository();
    await expect(commentRepository.addComment({})).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentAvailable('comment-123')).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.deleteComment('comment-123')).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.getCommentsByThreadId('thread-123')).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});