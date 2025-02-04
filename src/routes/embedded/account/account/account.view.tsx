import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AccountEmbeddedView() {
  const { wallets } = useEmbedded();

  return (
    <div>
      <h3>Account</h3>

      <pre>{JSON.stringify(wallets, null, 2)}</pre>

      <Link to="/">
        <button>Home</button>
      </Link>

      <Link to="/account/add-wallet">
        <button>Add Wallet</button>
      </Link>

      <Link to="/account/backup-shares">
        <button>Backup Shares</button>
      </Link>

      <Link to="/account/export-wallet">
        <button>Export Wallet</button>
      </Link>
    </div>
  );
}
