import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
// import CryptoJS from "crypto-js";

const socket = io("http://192.168.1.11:4530");

function App() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const handleRoomCreated = (code: string) => {
      setRoomCode(code);
      setInRoom(true);
    };

    const handleUserJoined = (userId: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${userId} joined the room`,
      ]);
    };

    const handleMessage = (encryptedMessage: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        decryptMessage(encryptedMessage),
      ]);
    };

    const handleInvalidRoom = () => {
      alert("Invalid room code.");
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("user-joined", handleUserJoined);
    socket.on("message", handleMessage);
    socket.on("invalid-room", handleInvalidRoom);

    // Clean up listeners on component unmount
    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("user-joined", handleUserJoined);
      socket.off("message", handleMessage);
      socket.off("invalid-room", handleInvalidRoom);
    };
  }, []);

  const createRoom = () => {
    socket.emit("create-room");
  };

  const joinRoom = () => {
    socket.emit("join-room", roomCode);

    setInRoom(true);
  };

  const sendMessage = () => {
    const encryptedMessage = encryptMessage(message);
    socket.emit("message", roomCode, encryptedMessage);
    setMessage("");
  };

  const encryptMessage = (message: string) => {
    return message;
  };

  const decryptMessage = (encryptedMessage: string) => {
    return encryptedMessage;
  };

  return (
    <div className="App">
      {!inRoom ? (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                joinRoom();
              }
            }}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <h2>Room Code: {roomCode}</h2>
          <div>
            {messages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
