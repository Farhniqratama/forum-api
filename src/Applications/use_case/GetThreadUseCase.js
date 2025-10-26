const DetailThread = require("../../Domains/threads/entities/DetailThread");

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    // Pastikan thread ada
    await this._threadRepository.verifyThreadAvailable(threadId);

    const thread = await this._threadRepository.getThreadById(threadId);

    // Ambil & urutkan komentar ASC by date
    const rawComments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );
    rawComments.sort((a, b) => a.date - b.date);

    const comments = await Promise.all(
      rawComments.map(async (c) => {
        const rawReplies = await this._replyRepository.getRepliesByCommentId(
          c.id
        );
        rawReplies.sort((a, b) => a.date - b.date);

        const replies = rawReplies.map((r) => {
          const isDeleted = (r.is_delete ?? r.isDelete) === true;
          return {
            id: r.id,
            username: r.username,
            date: r.date,
            content: isDeleted ? "**balasan telah dihapus**" : r.content,
            isDelete: isDeleted,
          };
        });

        const commentIsDeleted = (c.is_delete ?? c.isDelete) === true;
        return {
          id: c.id,
          username: c.username,
          date: c.date,
          content: commentIsDeleted ? "**komentar telah dihapus**" : c.content,
          isDelete: commentIsDeleted,
          replies,
        };
      })
    );

    return new DetailThread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments,
    });
  }
}

module.exports = GetThreadUseCase;
