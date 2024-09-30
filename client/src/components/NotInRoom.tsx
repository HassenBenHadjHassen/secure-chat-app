import { SecureChatViewModel } from "../SecureChatViewModel";

const NotInRoom = () => {
  const viewModel = SecureChatViewModel.getInstance();

  return (
    <div className="room-entry">
      <div className="username">
        <h3>Welcome, {viewModel.state?.username}</h3>
        <img
          src="https://www.svgrepo.com/download/436186/edit-tool-pencil.svg"
          alt="edit username"
          onClick={viewModel.onChangeUserNameClick}
        />
      </div>
      <div className="action-group">
        <span className="prompt-text">Would you like to create a room?</span>
        <button onClick={viewModel.createRoom} className="btn primary-btn">
          Create Room
        </button>
      </div>
      <div className="action-group">
        <span className="prompt-text">Or would you rather join one?</span>
        <div className="input-wrapper">
          <input
            className="input room-input"
            type="text"
            placeholder="Enter room code"
            value={viewModel.state?.roomCode}
            onChange={viewModel.onRoomCodeInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                viewModel.joinRoom();
              }
            }}
          />
          <button onClick={viewModel.joinRoom} className="btn secondary-btn">
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotInRoom;
