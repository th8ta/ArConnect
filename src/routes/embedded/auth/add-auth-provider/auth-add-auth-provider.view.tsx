import { useAuth } from "~utils/embedded/embedded.hooks";
import { Link } from "~wallets/router/components/link/Link";

export function AuthAddAuthProviderEmbeddedView() {
  const { authMethod } = useAuth();

  return (
    <di v>
      <h3>Add {authMethod}</h3>
      <p>...</p>
      <button disabled>Add {authMethod}</button>
      <Link to="/auth/add-wallet">Back</Link>
    </di>
  );
}
