const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository abstract class', () => {
  /**
   * Similar to CommentRepository, the ReplyRepository defines
   * abstract methods that concrete implementations must override.
   * These tests guard against accidentally leaving a method
   * unimplemented by ensuring that the base class throws the
   * appropriate error for each method.
   */
  it('should throw when invoking abstract methods', async () => {
    const replyRepository = new ReplyRepository();
    await expect(replyRepository.addReply({})).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyReplyOwner('reply-123', 'user-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyReplyAvailable('reply-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.deleteReply('reply-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.getRepliesByCommentId('comment-123')).rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});