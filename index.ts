import WebSocket = require("ws");

const port = parseInt((process.env.PORT as string) ?? 8080);
const wss = new WebSocket.Server({ port });

console.log(`Server started on port ${port}`);
// i know this won't scale well with lots of rooms
const rooms: any = [];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const recievedJSON = JSON.parse(message.toString());
    const { action, payload } = recievedJSON;

    switch (action) {
      case "create": {
        rooms.push({
          roomId: payload.roomId,
          users: [],
        });
        break;
      }
      case "join": {
        const roomIndex = rooms.findIndex(
          (room) => room.roomId === payload.roomId
        );
        rooms[roomIndex].users.push({
          username: payload.username,
          ws,
        });
        ws.send(
          JSON.stringify({
            action: "message",
            message: `Welcome to room ${payload.roomId} with ${rooms[roomIndex].users.length} people`,
          })
        );
        // to do: make these functions
        rooms[roomIndex].users.forEach((user) => {
          user.ws.send(
            JSON.stringify({
              action: "message",
              message: `${payload.username} joined`,
            })
          );
        });
        break;
      }
      case "playbackToggle": {
        const roomIndex = rooms.findIndex(
          (room) => room.roomId === payload.roomId
        );
        rooms[roomIndex].users.forEach((user) => {
          user.ws.send(
            JSON.stringify({
              action: "playbackToggle",
              message: `${payload.username} toggled playback`,
            })
          );
        });
        break;
      }
      default: {
        ws.send("error");
        break;
      }
    }
  });
});
