const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist comment and return added comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const newComment = {
        content: "sebuah comment",
        threadId: "thread-123",
        owner: "user-123",
      };

      const fakeIdGenerator = () => "123";
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepository.addComment(newComment);

      // Assert persist
      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual(newComment.content);
      expect(comments[0].thread_id).toEqual(newComment.threadId);
      expect(comments[0].owner).toEqual(newComment.owner);

      // Assert return value
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: newComment.content,
          owner: newComment.owner,
        })
      );
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when comment exists but not owned by user", async () => {
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

      const commentRepository = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-321")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should NOT throw NotFoundError nor AuthorizationError when comment exists and owned by user", async () => {
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

      const commentRepository = new CommentRepositoryPostgres(pool, {});
      // Jika ada NotFoundError / AuthorizationError maka promise akan reject
      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-123")
      ).resolves.toBeUndefined();
    });
  });

  describe("verifyCommentAvailable function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepository.verifyCommentAvailable("comment-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should NOT throw NotFoundError when comment exists", async () => {
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

      const commentRepository = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepository.verifyCommentAvailable("comment-123")
      ).resolves.toBeUndefined();
    });
  });

  describe("deleteComment function", () => {
    it("should soft delete comment", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
        isDelete: false,
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});
      await commentRepository.deleteComment("comment-123");

      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it("should return raw comments for a thread sorted by date", async () => {
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

      const date1 = new Date("2021-08-08T07:22:33.555Z");
      const date2 = new Date("2021-08-08T07:26:21.338Z");

      await CommentsTableTestHelper.addComment({
        id: "comment-111",
        content: "first comment",
        threadId: "thread-123",
        owner: "user-123",
        date: date1,
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-222",
        content: "second comment",
        threadId: "thread-123",
        owner: "user-321",
        date: date2,
        isDelete: true,
      });

      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepository.getCommentsByThreadId(
        "thread-123"
      );

      // Assert
      expect(comments).toHaveLength(2);

      // Sorted ascending by date
      expect(comments[0].id).toEqual("comment-111");
      expect(comments[1].id).toEqual("comment-222");

      // verify raw fields (no mapping di repository)
      expect(comments[0].username).toEqual("dicoding");
      expect(comments[0].content).toEqual("first comment");
      expect(comments[0].date).toBeInstanceOf(Date);
      expect(comments[0].date.getTime()).toEqual(date1.getTime());
      expect(comments[0].is_delete).toBe(false);

      expect(comments[1].username).toEqual("john");
      expect(comments[1].content).toEqual("second comment");
      expect(comments[1].date).toBeInstanceOf(Date); // ← tambahan
      expect(comments[1].date.getTime()).toEqual(date2.getTime()); // ← tambahan
      expect(comments[1].is_delete).toBe(true);
    });
  });
});
