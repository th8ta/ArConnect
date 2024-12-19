import { useAuth } from "~utils/authentication/authentication.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AccountEmbeddedView() {
  const { wallets } = useAuth();

  // TODO: Add special screen when using ArConnect. For MVP, no interface, only proxy.

  return (
    <div>
      <h3>Account</h3>

      <pre>{JSON.stringify(wallets, null, 2)}</pre>

      <Link to="/account/generate-wallet">
        <button>Generate Wallet</button>
      </Link>

      <Link to="/account/import-wallet">
        <button>Import Wallet</button>
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
