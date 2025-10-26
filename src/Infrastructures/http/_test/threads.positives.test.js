const createServer = require("../createServer");
const container = require("../../container");

describe("Threads endpoint (positive & 404)", () => {
  it("should 201 on POST /threads (auth) then 200 on GET /threads/{id}", async () => {
    const server = await createServer(container);

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

    const addRes = await server.inject({
      method: "POST",
      url: "/threads",
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: "judul", body: "isi" },
    });

    expect(addRes.statusCode).toBe(201);
    const addBody = JSON.parse(addRes.payload);
    const threadId = addBody.data.addedThread.id;

    const getRes = await server.inject({
      method: "GET",
      url: `/threads/${threadId}`,
    });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.payload);
    expect(getBody.status).toBe("success");
    expect(getBody.data.thread.id).toBe(threadId);
  });

  it("should 404 on GET /threads/{id} when not found", async () => {
    const server = await createServer(container);

    const res = await server.inject({
      method: "GET",
      url: "/threads/does-not-exist",
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("fail");
    expect(body.message).toBeDefined();
  });
});
