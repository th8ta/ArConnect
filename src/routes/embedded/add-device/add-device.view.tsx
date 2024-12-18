import { Link } from "~wallets/router/components/link/Link";

export function AddDeviceEmbeddedView() {
  return (
    <div>
      <h3>Add Device</h3>
      <p>...</p>
      <button disabled>Add Device</button>
      <Link to="/auth/generate-wallet">Back</Link>
    </div>
  );
}
