import { Link } from "~wallets/router/components/link/Link";

export function RecoverAccountEmbeddedView() {
  return (
    <div>
      <h3>Recover Account</h3>
      <p>...</p>
      <button disabled>Recover Account</button>
      <Link to="/auth">Back</Link>
    </div>
  );
}

// TODO: If I lose my shards but preserve auth access, can I just authenticate and generate a new wallet? Should this
// be a security setting (level selector):
//
// strict/disabled - Account recovery is not possible. Even if you have the private key, you can only create a new account and add it there.
// private key/signature - If you can provide the private key and generate a valid signature that we verify, you'll be able to add another auth method to your account. - What if tha wallet is linked to multiple accounts?
// authentication - If you can authenticate to your account but lost the shards, you'll be able to generate a new wallet for this account. - The old one will be marked as lost (read only) or completely deleted.
//
// Do we also need privacy settings to control how user accounts expose wallets? Thi should be attached to each wallet:
//
// - hidden - This wallet will no be listed in your accounts wallet unless you manually add it by providing its device shard. The device shard is always removed.
// - private - This wallet will be listed in your accounts wallets but only the last 4 digits of its address will be shown until you manually add it by providing its device shard. The device shard is persisted.
// - public - After authenticating, you'll see a list of all the wallets linked to your account.
//
// Note that to active a wallet, re-authentication is needed, so the device or recovery shard must be provided, plus a new auth token (new auth token !== re-authentication).
//
// In the MVP, all wallets are either private or public.
