import { SecureChatViewModel } from "../SecureChatViewModel";

const FirstModal = () => {
  const viewModel = SecureChatViewModel.getInstance();

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Welcome to the Chat App</h2>
        <p>
          This app allows you to create or join encrypted chat rooms. Enter a
          room code or create a new room to start chatting securely!
        </p>

        <p>
          All chats are client-side and are automatically deleted upon closing
          or refreshing the browser tab.
        </p>
        <button onClick={viewModel.closeFirstModal}>Get Started</button>
      </div>
    </div>
  );
};

export default FirstModal;
