const AddedComment = require('../AddedComment');

describe('AddedComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'comment',
      // owner missing
    };
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const payload = {
      id: 123,
      content: [],
      owner: {},
    };
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      owner: 'user-123',
    };
    const addedComment = new AddedComment(payload);
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});