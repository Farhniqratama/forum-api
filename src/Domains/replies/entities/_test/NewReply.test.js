const NewReply = require('../NewReply');

describe('NewReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      content: 'reply',
      commentId: 'comment-123',
      // owner missing
    };
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const payload = {
      content: [],
      commentId: 123,
      owner: {},
    };
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    const payload = {
      content: 'sebuah balasan',
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const newReply = new NewReply(payload);
    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.owner).toEqual(payload.owner);
  });
});