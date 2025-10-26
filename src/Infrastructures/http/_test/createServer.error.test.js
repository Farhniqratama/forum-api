const createServer = require("../createServer");
const container = require("../../container");

describe("createServer - error formatter branch (500)", () => {
  it('should wrap unhandled error into {status:"error", message:"terjadi kegagalan pada server kami"}', async () => {
    const server = await createServer(container);

    server.route({
      method: "GET",
      path: "/throw",
      handler: () => {
        throw new Error("BOOM");
      },
    });

    const res = await server.inject({ method: "GET", url: "/throw" });
    const body = JSON.parse(res.payload);

    expect(res.statusCode).toBe(500);
    expect(body.status).toBe("error");
    expect(body.message).toBe("terjadi kegagalan pada server kami");
  });
});
