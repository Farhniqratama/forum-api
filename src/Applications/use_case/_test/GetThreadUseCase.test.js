const GetThreadUseCase = require("../GetThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");

describe("GetThreadUseCase", () => {
  it("should orchestrate get thread detail correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };
    const thread = {
      id: useCasePayload.threadId,
      title: "sebuah thread",
      body: "sebuah body",
      date: new Date("2021-08-08T07:19:09.775Z"),
      username: "dicoding",
    };
    const comments = [
      {
        id: "comment-123",
        username: "dicoding",
        date: new Date("2021-08-08T07:22:33.555Z"),
        content: "sebuah comment",
      },
      {
        id: "comment-124",
        username: "johndoe",
        date: new Date("2021-08-08T07:26:21.338Z"),
        content: "**komentar telah dihapus**",
      },
    ];
    const repliesForComment123 = [
      {
        id: "reply-123",
        username: "dicoding",
        date: new Date("2021-08-08T07:59:48.766Z"),
        content: "sebuah balasan",
        isDelete: false,
      },
    ];
    const repliesForComment124 = [];
    // Create mocks
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailable = jest.fn().mockResolvedValue();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    // WAJIB: mock verifyThreadAvailable agar tidak lempar METHOD_NOT_IMPLEMENTED
    mockThreadRepository.verifyThreadAvailable = jest.fn().mockResolvedValue();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(thread);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(comments);
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation((commentId) => {
        if (commentId === "comment-123")
          return Promise.resolve(repliesForComment123);
        return Promise.resolve(repliesForComment124);
      });

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCasePayload);

    // Assert: verify return is instance of DetailThread
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(thread.id);
    expect(detailThread.title).toEqual(thread.title);
    expect(detailThread.body).toEqual(thread.body);
    expect(detailThread.date).toEqual(thread.date);
    expect(detailThread.username).toEqual(thread.username);
    expect(detailThread.comments).toHaveLength(2);
    // first comment should contain replies
    expect(detailThread.comments[0].replies).toEqual(repliesForComment123);
    expect(detailThread.comments[1].replies).toEqual(repliesForComment124);

    // verify each repository called with correct parameters
    expect(mockThreadRepository.verifyThreadAvailable).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCasePayload.threadId
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      "comment-123"
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      "comment-124"
    );
  });
});
