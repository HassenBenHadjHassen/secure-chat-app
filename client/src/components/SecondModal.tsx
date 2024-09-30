import { SecureChatViewModel } from "../SecureChatViewModel";

const SecondModal = () => {
  const viewModel = SecureChatViewModel.getInstance();

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Set Your Username</h2>
        <input
          className="input"
          type="text"
          placeholder="Enter Username"
          value={viewModel.state?.username}
          onChange={viewModel.onUsernameInputChange}
        />
        <div>
          <button onClick={viewModel.setUsernameFun} className="btn">
            Set Username
          </button>
          <button onClick={viewModel.continueAsAnonymous} className="btn">
            Continue as Anonymous
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondModal;
