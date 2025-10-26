// src/Infrastructures/http/_test/replies.positives.test.js
const createServer = require("../createServer");
const container = require("../../container");

describe("Replies endpoint (positive cases)", () => {
  it("should add and soft-delete reply successfully, then show deleted marker in thread detail", async () => {
    const server = await createServer(container);

    // register + login
    await server.inject({
      method: "POST",
      url: "/users",
      payload: { username: "neo", password: "secret", fullname: "Neo" },
    });
    const loginRes = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "neo", password: "secret" },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginRes.payload);

    // thread + comment
    const t = await server.inject({
      method: "POST",
      url: "/threads",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: "judul", body: "isi" },
    });
    const threadId = JSON.parse(t.payload).data.addedThread.id;

    const c = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: "komen" },
    });
    const commentId = JSON.parse(c.payload).data.addedComment.id;

    // add reply
    const r = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: "balasan" },
    });
    expect(r.statusCode).toBe(201);
    const replyId = JSON.parse(r.payload).data.addedReply.id;

    // delete reply
    const del = await server.inject({
      method: "DELETE",
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(del.statusCode).toBe(200);
    expect(JSON.parse(del.payload).status).toBe("success");

    // get thread detail -> reply jadi marker "**balasan telah dihapus**"
    const detail = await server.inject({
      method: "GET",
      url: `/threads/${threadId}`,
    });
    expect(detail.statusCode).toBe(200);
    const thread = JSON.parse(detail.payload).data.thread;
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0].replies).toHaveLength(1);
    expect(thread.comments[0].replies[0].id).toBe(replyId);
    expect(thread.comments[0].replies[0].content).toBe(
      "**balasan telah dihapus**"
    );
  });
});
