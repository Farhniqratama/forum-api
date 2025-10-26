const AddReplyUseCase = require("../AddReplyUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

describe("AddReplyUseCase", () => {
  it("should orchestrate add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      content: "sebuah balasan",
      owner: "user-123",
    };
    const expectedAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    mockThreadRepository.verifyThreadAvailable = jest.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentAvailable = jest
      .fn()
      .mockResolvedValue();
    mockReplyRepository.addReply = jest.fn(
      async (newReplyEntity) =>
        new AddedReply({
          id: "reply-123",
          content: newReplyEntity.content,
          owner: newReplyEntity.owner,
        })
    );

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadAvailable).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentAvailable).toHaveBeenCalledWith(
      useCasePayload.commentId
    );
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new NewReply(useCasePayload)
    );
  });
});
