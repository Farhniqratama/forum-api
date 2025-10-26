const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist reply and return added reply correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      const newReply = {
        content: "sebuah balasan",
        commentId: "comment-123",
        owner: "user-123",
      };
      const fakeIdGenerator = () => "123";
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      // Action
      const addedReply = await replyRepository.addReply(newReply);
      // Assert persist
      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toEqual(newReply.content);
      expect(replies[0].comment_id).toEqual(newReply.commentId);
      expect(replies[0].owner).toEqual(newReply.owner);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: newReply.content,
          owner: newReply.owner,
        })
      );
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        replyRepository.verifyReplyOwner("reply-123", "user-123")
      ).rejects.toThrowError(NotFoundError);
    });
    it("should throw AuthorizationError when reply exists but not owned by user", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await UsersTableTestHelper.addUser({ id: "user-321", username: "john" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        replyRepository.verifyReplyOwner("reply-123", "user-321")
      ).rejects.toThrowError(AuthorizationError);
    });
    it("should not throw error when reply exists and owned by user", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        replyRepository.verifyReplyOwner("reply-123", "user-123")
      ).resolves.toBeUndefined();
    });
  });

  describe("verifyReplyAvailable function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        replyRepository.verifyReplyAvailable("reply-123")
      ).rejects.toThrowError(NotFoundError);
    });
    it("should not throw error when reply exists", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        replyRepository.verifyReplyAvailable("reply-123")
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteReply function", () => {
    it("should soft delete reply", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
        isDelete: false,
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await replyRepository.deleteReply("reply-123");
      const replies = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return raw replies for a comment sorted by date", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await UsersTableTestHelper.addUser({ id: "user-321", username: "john" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      // Insert replies with different dates and deletion flags
      const date1 = new Date("2021-08-08T07:59:48.766Z");
      const date2 = new Date("2021-08-08T08:07:01.522Z");
      await RepliesTableTestHelper.addReply({
        id: "reply-111",
        commentId: "comment-123",
        content: "first reply",
        owner: "user-321",
        date: date1,
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-222",
        commentId: "comment-123",
        content: "second reply",
        owner: "user-123",
        date: date2,
        isDelete: false,
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      // Action
      const replies = await replyRepository.getRepliesByCommentId(
        "comment-123"
      );
      // Assert
      expect(replies).toHaveLength(2);
      // Sorted ascending by date
      expect(replies[0].id).toEqual("reply-111");
      expect(replies[1].id).toEqual("reply-222");
      // verify raw content and username
      expect(replies[0].username).toEqual("john");
      expect(replies[0].content).toEqual("first reply");
      // PG returns Date object for timestamp
      expect(replies[0].date).toBeInstanceOf(Date);
      expect(replies[0].is_delete).toBe(true);
      expect(replies[1].username).toEqual("dicoding");
      expect(replies[1].content).toEqual("second reply");
      expect(replies[1].is_delete).toBe(false);
    });
  });
});
