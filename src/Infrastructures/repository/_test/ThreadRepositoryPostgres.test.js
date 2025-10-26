const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const newThread = {
        title: 'sebuah thread',
        body: 'sebuah body',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepository.addThread(newThread);

      // Assert: should persist
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      // Should return AddedThread correctly
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: newThread.owner,
      }));
    });
  });

  describe('verifyThreadAvailable function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(threadRepository.verifyThreadAvailable('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(threadRepository.verifyThreadAvailable('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(threadRepository.getThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly when thread is found', async () => {
      // Arrange
      const date = new Date();
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'title', body: 'body', owner: 'user-123', date });
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      // Action
      const thread = await threadRepository.getThreadById('thread-123');
      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('title');
      expect(thread.body).toEqual('body');
      expect(thread.username).toEqual('dicoding');
      // Date is returned as Date object; the underlying time value should equal
      expect(thread.date).toBeInstanceOf(Date);
      expect(thread.date.getTime()).toEqual(date.getTime());
    });
  });
});