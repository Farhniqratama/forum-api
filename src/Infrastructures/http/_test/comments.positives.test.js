// src/Infrastructures/http/_test/comments.positives.test.js
const createServer = require("../createServer");
const container = require("../../container");

describe("Comments endpoint (positive cases)", () => {
  it("should add and soft-delete comment successfully, then show deleted marker in thread detail", async () => {
    const server = await createServer(container);

    // 1) register + login
    await server.inject({
      method: "POST",
      url: "/users",
      payload: { username: "alice", password: "secret", fullname: "Alice" },
    });
    const loginRes = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "alice", password: "secret" },
    });
    const {
      data: { accessToken },
    } = JSON.parse(loginRes.payload);

    // 2) create thread
    const addThreadRes = await server.inject({
      method: "POST",
      url: "/threads",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: "judul", body: "isi thread" },
    });
    expect(addThreadRes.statusCode).toBe(201);
    const threadId = JSON.parse(addThreadRes.payload).data.addedThread.id;

    // 3) add comment
    const addCommentRes = await server.inject({
      method: "POST",
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: "komentar pertama" },
    });
    expect(addCommentRes.statusCode).toBe(201);
    const addedComment = JSON.parse(addCommentRes.payload).data.addedComment;
    expect(addedComment).toHaveProperty("id");
    expect(addedComment).toHaveProperty("content", "komentar pertama");
    expect(addedComment).toHaveProperty("owner");

    // 4) delete comment (soft delete)
    const deleteRes = await server.inject({
      method: "DELETE",
      url: `/threads/${threadId}/comments/${addedComment.id}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(deleteRes.statusCode).toBe(200);
    const deleteBody = JSON.parse(deleteRes.payload);
    expect(deleteBody.status).toBe("success");

    // 5) get thread detail -> comment jadi marker "**komentar telah dihapus**"
    const detailRes = await server.inject({
      method: "GET",
      url: `/threads/${threadId}`,
    });
    expect(detailRes.statusCode).toBe(200);
    const detail = JSON.parse(detailRes.payload).data.thread;
    expect(detail.comments).toHaveLength(1);
    expect(detail.comments[0].id).toBe(addedComment.id);
    expect(detail.comments[0].content).toBe("**komentar telah dihapus**");
  });
});
