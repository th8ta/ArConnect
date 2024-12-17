import { WalletsService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";
import { Link } from "~wallets/router/components/link/Link";

export function RestoreShardsEmbeddedView() {
  const handleContinue = async (
    walletAddress: string,
    recoveryShare: string
  ) => {
    // TODO: This registers a "recovery" event on the backend:
    const recoveryChallenge =
      WalletsService.fetchRecoveryChallenge(walletAddress);

    const recoveryChallengeSignature = null;

    const authRecoveryShare = WalletsService.resolveRecoveryChallenge(
      recoveryChallengeSignature
    );

    const jwk = WalletUtils.recoverWalletJWK([
      authRecoveryShare,
      recoveryShare
    ]);

    const { authShare, deviceShare } =
      await WalletUtils.generateWalletWorkShares(jwk);

    // TODO: The new authShare needs to be updated to the backend, meaning also changing the deviceNonce
    const oldDeviceNonce = WalletUtils.getDeviceNonce();

    if (!oldDeviceNonce) throw new Error("Missing `deviceNonce`");

    const deviceNonce = WalletUtils.generateDeviceNonce();

    // TODO: This wallet needs to be regenerated as well and the authShare updated. If this is not done after X
    // "warnings", the Shards entry will be removed anyway.
    await WalletsService.rotateDeviceShares({
      oldDeviceNonce,
      newDeviceNonce: deviceNonce,
      newShares: [authShare, deviceShare]
    });

    // TODO: Maybe WalletUtils.updateDeviceNonce(); already does this:
    WalletUtils.storeDeviceNonce(deviceNonce);
    WalletUtils.storeDeviceShare(deviceShare);

    const randomPassword = WalletUtils.generateRandomPassword();

    WalletUtils.storeKeyfile(jwk, randomPassword);

    // TODO: Generate new wallet and simply add it to mockedAuthenticateData and ExtensionStorage, then make sure the
    // router forces users out the auth screens and see if signing, etc. works.

    // TODO: Should the wallet auto-connect to the page?
  };

  return (
    <div>
      <h3>Restore Shards</h3>
      <p>...</p>
      <button onClick={handleContinue}>Continue</button>

      <Link to="/auth/recover-account">
        <button>Lost my credentials</button>
      </Link>
    </div>
  );
}
