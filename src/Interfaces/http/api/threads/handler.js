const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadUseCase = require("../../../../Applications/use_case/GetThreadUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { title, body } = request.payload;

    const addedThread = await addThreadUseCase.execute({ title, body, owner });
    const response = h.response({ status: "success", data: { addedThread } });
    response.code(201);
    return response;
  }

  async getThreadHandler(request) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const { threadId } = request.params;
    const thread = await getThreadUseCase.execute({ threadId });
    return { status: "success", data: { thread } };
  }
}

module.exports = ThreadsHandler;
