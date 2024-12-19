import { useRef } from "react";
import { useAuth } from "~utils/authentication/authentication.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AccountBackupSharesEmbeddedView() {
  const { promptToBackUp, skipBackUp, registerBackUp } = useAuth();

  const checkboxRef = useRef<HTMLInputElement>();

  const handleSkipClicked = () => {
    skipBackUp(checkboxRef?.current.checked);
  };

  return (
    <div>
      <h3>Backup Recovery Shares</h3>
      <p>...</p>

      <label>
        <input type="checkbox" ref={checkboxRef} />
        Do not ask again
      </label>

      <button disabled>Download Recovery File</button>

      {promptToBackUp ? (
        <Link to="/account" onClick={handleSkipClicked}>
          <button>Skip</button>
        </Link>
      ) : (
        <Link to="/account">
          <button>Back</button>
        </Link>
      )}
    </div>
  );
}
