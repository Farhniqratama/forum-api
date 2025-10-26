const DetailThread = require('../DetailThread');

describe('DetailThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: new Date(),
      // username missing
    };
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'title',
      body: [],
      date: '2021-01-01',
      username: {},
    };
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailThread object correctly with default comments', () => {
    const date = new Date();
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date,
      username: 'dicoding',
      comments: [],
    };
    const detailThread = new DetailThread(payload);
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});