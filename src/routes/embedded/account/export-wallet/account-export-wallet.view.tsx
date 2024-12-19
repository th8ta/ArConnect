import { Link } from "~wallets/router/components/link/Link";

export function AccountExportWalletEmbeddedView() {
  return (
    <div>
      <h3>Export Wallet</h3>
      <p>...</p>

      <button disabled>Copy SeedPhrase</button>
      <button disabled>Download Keyfile</button>

      <Link to="/account">
        <button>Back</button>
      </Link>
    </div>
  );
}
