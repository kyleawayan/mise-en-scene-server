import WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

console.log("Server started");
// i know this won't scale well with lots of rooms
const rooms: any = [];

wss.on("connection", (ws) => {
  console.log(ws);
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
        rooms[roomIndex].users.push(ws);
        console.log(rooms);
        break;
      }
      default: {
        ws.send("error");
        break;
      }
    }
  });
});
