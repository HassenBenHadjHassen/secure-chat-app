import { useRef } from "react";
import { SecureChatViewModel } from "./SecureChatViewModel";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const InRoom = () => {
  const viewModel = SecureChatViewModel.getInstance();

  const typingTimeoutRef = useRef<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chat-room">
      <h2 style={{ textAlign: "center" }}>
        Room Code: {viewModel.state?.roomCode}
      </h2>
      <div className="messages">
        {viewModel.state?.messages
          .slice()
          .reverse()
          .map((msg, index) => (
            <div
              key={index}
              className={`message-container ${
                msg.sender === viewModel.state?.username
                  ? "outgoing"
                  : "incoming"
              }`}
            >
              <span
                className={`sender-name ${
                  msg.sender === viewModel.state?.username
                    ? "outgoing-name"
                    : "incoming-name"
                }`}
              >
                {msg.sender}
              </span>
              <div
                className={`message ${
                  msg.sender === viewModel.state?.username
                    ? "outgoing"
                    : "incoming"
                }`}
              >
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
      </div>

      <div>
        {viewModel.state?.typing && (
          <span className="typing">{viewModel.state?.typing}</span>
        )}
      </div>
      <div className="spacing">
        <div className="room-input">
          <input
            ref={inputRef}
            className="input"
            type="text"
            placeholder="Enter message"
            value={viewModel.state?.message}
            onChange={(e) => viewModel.onMessageChange(e, typingTimeoutRef)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                viewModel.sendMessage();
              }
            }}
          />
          <button
            className="emoji-button"
            onClick={viewModel.onShowEmojiPickerButtonClick}
          >
            😊
          </button>

          {viewModel.state?.showEmojiPicker && (
            <div className="emoji-picker">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) =>
                  viewModel.addEmoji(emoji, inputRef)
                }
              />
            </div>
          )}
        </div>

        <button onClick={viewModel.sendMessage} className="btn">
          Send
        </button>
      </div>
    </div>
  );
};

export default InRoom;
