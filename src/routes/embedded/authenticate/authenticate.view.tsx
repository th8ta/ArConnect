import { useAuth } from "~utils/authentication/authentication.hooks";

export function AuthenticateEmbeddedView() {
  const { mockedAuthenticate } = useAuth();

  // TODO: Add special screen when using ArConnect. For MVP, no interface, only proxy.

  return (
    <div>
      <h3>Authentication</h3>
      <button>ArConnect</button>

      <button>Passkey (sign up)</button>
      <button>Social (sign up)</button>

      <button>Passkey (sign in)</button>
      <button>Social (sign in)</button>

      <button>Lost my credentials</button>

      <button>Delete device shard</button>
    </div>
  );
}
