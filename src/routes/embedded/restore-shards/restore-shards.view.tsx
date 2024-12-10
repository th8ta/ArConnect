import { Link } from "~wallets/router/components/link/Link";

export function RestoreShardsEmbeddedView() {
  return (
    <div>
      <h3>Restore Shards</h3>
      <p>...</p>

      <Link to="/auth/recover-account">
        <button>Lost my credentials</button>
      </Link>
    </div>
  );
}
