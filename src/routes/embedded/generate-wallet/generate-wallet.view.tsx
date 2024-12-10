export function GenerateWalletEmbeddedView() {
  // TODO:
  // Eagerly after we know the user is not authenticated:
  // 1. Create key
  // 2. Shard it
  // 3. Compute each shard's hash
  // Only once the user lands on this screen and clicks continue (the other options start at step 2)
  // 4. Store device shard locally (encrypted with auth shard and recovery shard)
  // 5. Store auth shard + the other 2 hashes in fake backend (encrypted with recovery shard and recovery shard)
  // 6. Discard the recovery shard for now.
  // 7. Generate a random password
  // 8. Store the private key, encrypted with that password, but keep that password in memory (until this is addressed for the extension as well).
  //
  // The next time I authenticate, I'll send my device shard's hash to the backend and it will reply with a list of all my wallets and the auth shard
  // for the one I sent. If I want to activate a different one, it should ask me to authenticate again (but authentication should last for some time).

  // Sidenotes:
  //
  // If I sign in with a valid account but have no device shard, the backend will know what are my wallets. The frontend
  // should then prompt me to add the recovery shard (/auth/restore) (e.g. it looks like it is your first time accessing
  // your account from this device. please, provide your recovery shard / select which wallet you'd like to use)
  //
  // Keep track of last used wallet to activate that one after signing in.

  return (
    <div>
      <h3>Account Confirmation</h3>
      <p>Your wallet has been created</p>
      <button>I already have a wallet</button>
      <button>Link this device to an existing account</button>
      <button>Link PROVIDER to an existing account</button>
      <button>Continue</button>
    </div>
  );
}
