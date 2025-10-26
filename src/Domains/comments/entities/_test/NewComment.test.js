const NewComment = require('../NewComment');

describe('NewComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      // owner missing
    };
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: [],
      owner: {},
    };
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment object correctly', () => {
    const payload = {
      content: 'sebuah comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };
    const newComment = new NewComment(payload);
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });
});