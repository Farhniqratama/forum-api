const NewThread = require('../NewThread');

describe('NewThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange: missing body and owner
    const payload = {
      title: 'title',
    };

    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    // Arrange: title is number, body is boolean, owner is array
    const payload = {
      title: 123,
      body: true,
      owner: [],
    };
    // Action & Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body',
      owner: 'user-123',
    };
    // Action
    const newThread = new NewThread(payload);
    // Assert
    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});