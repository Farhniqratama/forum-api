const AddThreadUseCase = require("../AddThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");

describe("AddThreadUseCase", () => {
  it("should orchestrate adding thread correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread",
      body: "sebuah body",
      owner: "user-123",
    };
    const expectedAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    // mock dependencies
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn(
      async (newThreadEntity) =>
        // Boleh gunakan nilai dari input agar “netral”
        new AddedThread({
          id: "thread-123",
          title: newThreadEntity.title,
          owner: newThreadEntity.owner,
        })
    );

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new NewThread(useCasePayload)
    );
  });
});
