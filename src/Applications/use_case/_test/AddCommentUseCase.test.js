const AddCommentUseCase = require("../AddCommentUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

describe("AddCommentUseCase", () => {
  it("should orchestrate add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      content: "sebuah comment",
      owner: "user-123",
    };
    const expectedAddedComment = new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadAvailable = jest.fn().mockResolvedValue();
    mockCommentRepository.addComment = jest.fn(
      async (newCommentEntity) =>
        new AddedComment({
          id: "comment-123",
          content: newCommentEntity.content,
          owner: newCommentEntity.owner,
        })
    );

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThreadAvailable).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      new NewComment(useCasePayload)
    );
  });
});
