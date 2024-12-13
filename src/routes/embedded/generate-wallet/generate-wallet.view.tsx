import { useAuth } from "~utils/authentication/authentication.hooks";
import { WalletService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";
import { Link } from "~wallets/router/components/link/Link";

export function GenerateWalletEmbeddedView() {
  const { authMethod } = useAuth();

  // TODO:
  // Eagerly after we know the user is not authenticated:
  // 1. Create key
  // 2. Shard it
  // 3. Compute each shard's hash
  // Only once the user lands on this screen and clicks continue (the other options start at step 2)
  // 4. Encrypt and store the seedphrase (on the backend?)
  // 5. Store device shard locally (JUST RAW ~~encrypted with auth shard and recovery shard~~)
  // 6. Store auth shard (encrypted with recovery shard and recovery shard) + the other 2 hashes in fake backend
  // 7. Discard the recovery shard for now.
  // 8. Generate a random password
  // 9. Store the private key, encrypted with that password, but keep that password in memory (until this is addressed for the extension as well).
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

  // Scenarios to test:

  // 1. Sign up. Account created. deviceNonce generated. authShare stored. deviceShare persisted.

  // 2. Download recoveryShare. authRecoveryShare stored. recoveryShare stored encrypted.

  // 3. Re-download recoveryShare. Should be the same.

  // 3. (A+D) Reload. Account fetched. authShare fetched, providing deviceNonce. pk reconstructed.

  // 4A. (AR+R) Delete deviceShare. Reload. Account fetched. no authShare fetched, deviceNonce not sent (because
  //    deviceShare is missing). Recovery screen. recoveryShare provided. authRecoveryShare fetched.
  //    pk reconstructed. pk re-split into new deviceShare and authShare. Recovery stays the same. deviceNonce with
  //    corresponding authShare stays on the server (we have no way to tell if it's still needed).

  // 4B. (AR+R) Delete deviceNonce. Same as above.

  // 5A. encrypted recoveryShare deleted. Download recoveryShard. It needs to be re-split, so a new recoveryShare -
  //    authRecoveryShare is generated and stored.

  // 5B. encrypted recoveryShare deleted. Download recoveryShard. It needs to be re-split, so a new recoveryShare -
  //    authRecoveryShare is generated and stored. The backend says only 2 can be stored, so user must pick which one
  //    to delete.

  // 6. (DR+R) Recover account. This rare scenario happens when the user loses access to their authentication,
  //    but still has access to a previously used device and recoveryShare.
  //    recoveryShare provided. pk reconstructed. Challenge signature sent. Old auth methods
  //    cleared. New one added. pk re-split. deviceNonce, authShare and deviceShare generated.

  // 7 (DR + AR) Recover account. This rare scenario happens when the user has access to a previously used device that
  //   somehow lost the deviceShare, but not the deviceRecoveryShare, and they do not have the recovery share (so 6 and
  //   4 not possible). This is unlikely to happen, so we could not serve AR, given DR, only given R. This just happens
  //   to be a possibility if we go for a 2/3 SSS scheme for the recovery shares to enable DR+R.

  // 7. (pk) Recover account. pk provided. Signature sent. Auth methods cleared. pk re-split.

  // 8. Weird scenarios where the address is not right.

  // Possible solutions:

  // Option 1 (2/3):
  //
  // Use 2/3 SSS: deviceShare + authShare + recoveryShare with only external backup for the recovery share. This allows us
  // to constantly update it as the other shares change.
  //
  // Stores authShare x 2 + 2 hashes = 4
  //
  // Issues:
  //
  // - Need to store new device, auth and recovery share every time they are recombined.
  // - Cannot work with downloadable recoveryShares, as then we would have to maintain all the deviceShares as well.
  //
  // Option 2 (2/2 x 2):
  //
  // Use 2 2/2 SSS: deviceShare + authShare (which are "regularly" reconstructed) and recoveryShare + authRecoveryShare
  //
  // Stores authShare x 1 + 1 hash (or public key) + recoveryAuthShare x 1 + 1 hash = 4
  //
  // Issues:
  //
  // - Need to store (only) device and auth share when recombined OR authRecovery if a new recovery is downloaded.
  // - Need to store multiple recoveryAuthShares (every time (or almost, as they can be stored encrypted in localStorage) the recovery share is downloaded).
  //
  // Option 3 (3/5):
  //
  // Use 3/5 SSS: dev1, dev2, auth1, auth2, recovery and update the SSS implementation so that the recovery share can
  // be rebuilt.
  //
  // Stores auth1 x 3 + auth2 x 3 + 3 hashes = 9
  //
  // Issues:
  //
  // - Needs more storage.
  // - Need to update SSS to accept predefined shares AND store coefficients.
  // - Recovery share files should include a signature from the server so that we know that was once valid, but not
  //   anymore.
  //
  // Options notes:
  //
  // - Rotation is actually a requirement. We can ever rotate the recoveryShare if using external backup.
  // - Having external backup of the recovery might allow us to automatically rebuild the pk (no recovery share upload needed)
  //

  const handleContinue = async () => {
    const seedPhrase = await WalletUtils.generateSeedPhrase();
    const jwk = await WalletUtils.generateWalletJWK(seedPhrase);
    const { authShare, deviceShare } =
      await WalletUtils.generateWalletWorkShares(jwk);

    // if (maintainSeedPhrase) {
    //   const encryptedSeedPhrase = crypto.subtle.encrypt();
    //   WalletUtils.storeEncryptedSeedPhrase(encryptedSeedPhrase);
    // }

    // TODO: This should probably be generated on init in the provider. Instead, the getter should just reload the wallet
    // (so that it re-initializes) if the deviceNonce is missing at some point (which should not happen unless someone
    // is tampering with it).

    const deviceNonce = WalletUtils.getOrGenerateDeviceNonce();

    await WalletService.createWallet({
      deviceNonce,
      walletType: "public",
      publicKey: jwk.n,
      authShare
    });

    WalletUtils.storeDeviceNonce(deviceNonce);
    WalletUtils.storeDeviceShare(deviceShare);

    const randomPassword = WalletUtils.generateRandomPassword();

    WalletUtils.storePrivateKeyAndPassword(jwk, randomPassword);

    // TODO: Generate new wallet and simply add it to mockedAuthenticateData and ExtensionStorage, then make sure the
    // router forces users out the auth screens and see if signing, etc. works.

    // TODO: Should the wallet auto-connect to the page?
  };

  return (
    <div>
      <h3>Account Confirmation</h3>
      <p>Your wallet has been created</p>
      <button onClick={handleContinue}>Continue</button>

      <Link to="/auth/import-wallet">
        <button>I already have a wallet</button>
      </Link>

      {authMethod === "passkey" ? (
        <Link to="/auth/add-device">
          <button>Add this device to an existing account</button>
        </Link>
      ) : (
        <Link to="/auth/add-device">
          <button>Add {authMethod} to an existing account</button>
        </Link>
      )}
    </div>
  );
}
