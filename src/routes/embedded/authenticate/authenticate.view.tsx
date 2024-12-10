import { useAuth } from "~utils/authentication/authentication.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AuthenticateEmbeddedView() {
  const { authenticate } = useAuth();

  // TODO: Add special screen when using ArConnect. For MVP, no interface, only proxy.

  return (
    <div>
      <h3>Authentication</h3>

      <button onClick={() => authenticate("passkey")}>Passkey</button>
      <button disabled>ArConnect</button>
      <button onClick={() => authenticate("emailPassword")}>
        Email & Password
      </button>
      <button onClick={() => authenticate("google")}>Google</button>

      <Link to="/auth/recover-account">
        <button>Lost my credentials</button>
      </Link>

      <button disabled>Delete device shard</button>
    </div>
  );
}
