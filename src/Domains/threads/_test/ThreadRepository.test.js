const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository abstract class', () => {
  /**
   * The ThreadRepository defines abstract methods which concrete
   * implementations must override. These unit tests ensure the base
   * class throws the expected error for each abstract method. This
   * helps catch cases where a developer forgets to implement one of
   * the required methods when extending ThreadRepository.
   */
  it('should throw when invoking abstract methods', async () => {
    const threadRepository = new ThreadRepository();
    await expect(threadRepository.addThread({})).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.verifyThreadAvailable('thread-123')).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.getThreadById('thread-123')).rejects.toThrow('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});