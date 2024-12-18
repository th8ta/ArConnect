import { useAuth } from "~utils/authentication/authentication.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AddAuthProviderEmbeddedView() {
  const { authMethod } = useAuth();

  return (
    <div>
      <h3>Add {authMethod}</h3>
      <p>...</p>
      <button disabled>Add {authMethod}</button>
      <Link to="/auth/generate-wallet">Back</Link>
    </div>
  );
}
