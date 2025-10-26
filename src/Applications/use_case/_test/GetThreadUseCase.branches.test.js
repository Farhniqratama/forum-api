// src/Applications/use_case/_test/GetThreadUseCase.branches.test.js
const GetThreadUseCase = require("../GetThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const DetailThread = require("../../../Domains/threads/entities/DetailThread");

describe("GetThreadUseCase (branches)", () => {
  it("should map deleted comment/reply content & sort comments/replies by date", async () => {
    // Arrange
    const useCasePayload = { threadId: "thread-xyz" };

    const thread = {
      id: "thread-xyz",
      title: "judul",
      body: "isi",
      date: new Date("2021-08-08T07:19:09.775Z"),
      username: "dicoding",
    };

    // comments dibuat tidak urut, agar cabang sorting ter-cover
    const commentsRaw = [
      {
        id: "comment-2",
        username: "john",
        date: new Date("2021-08-08T07:26:21.338Z"),
        content: "akan terhapus",
        is_delete: true, // harus jadi "**komentar telah dihapus**"
      },
      {
        id: "comment-1",
        username: "dicoding",
        date: new Date("2021-08-08T07:22:33.555Z"),
        content: "komentar asli",
        is_delete: false,
      },
    ];

    // replies utk comment-1: tidak urut + ada yang terhapus
    const repliesForComment1 = [
      {
        id: "reply-b",
        username: "jane",
        date: new Date("2021-08-08T08:07:01.522Z"),
        content: "yang terhapus",
        is_delete: true, // harus jadi "**balasan telah dihapus**"
      },
      {
        id: "reply-a",
        username: "dicoding",
        date: new Date("2021-08-08T07:59:48.766Z"),
        content: "balasan asli",
        is_delete: false,
      },
    ];
    const repliesForComment2 = []; // kosong

    // mock repos
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailable = jest.fn().mockResolvedValue();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(thread);
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockResolvedValue(commentsRaw);
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      .mockImplementation((commentId) => {
        if (commentId === "comment-1")
          return Promise.resolve(repliesForComment1);
        if (commentId === "comment-2")
          return Promise.resolve(repliesForComment2);
        return Promise.resolve([]);
      });

    const useCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const result = await useCase.execute(useCasePayload);

    // Assert (harus instance DetailThread)
    expect(result).toBeInstanceOf(DetailThread);
    expect(result.id).toBe(thread.id);
    expect(result.username).toBe(thread.username);

    // Komentar harus tersortir ASC by date: comment-1 (lebih awal) lalu comment-2
    expect(result.comments.map((c) => c.id)).toEqual([
      "comment-1",
      "comment-2",
    ]);

    // Mapping konten comment yang terhapus
    expect(result.comments[1].content).toBe("**komentar telah dihapus**");

    // Replies utk comment-1 harus tersortir ASC dan memetakan yang terhapus
    const r = result.comments[0].replies;
    expect(r.map((x) => x.id)).toEqual(["reply-a", "reply-b"]);
    expect(r[0].content).toBe("balasan asli");
    expect(r[1].content).toBe("**balasan telah dihapus**");

    // Verifikasi pemanggilan repos (branch verifyThreadAvailable juga ter-cover)
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
      "comment-1"
    );
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith(
      "comment-2"
    );
  });
});
