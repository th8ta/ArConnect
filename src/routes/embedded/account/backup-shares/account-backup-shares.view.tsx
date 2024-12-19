import { useAuth } from "~utils/authentication/authentication.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AccountBackupSharesEmbeddedView() {
  const { promptToBackUp, skipBackUp, registerBackUp } = useAuth();

  return (
    <div>
      <h3>Backup Recovery Shares</h3>
      {promptToBackUp ? <p>...</p> : <p>...</p>}

      <button disabled>Download Recovery File</button>

      <Link to="/account">
        <button>Back</button>
      </Link>
    </div>
  );
}
