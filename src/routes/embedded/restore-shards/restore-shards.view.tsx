import { useAuth } from "~utils/authentication/authentication.hooks";
import { WalletService } from "~utils/wallets/wallets.service";
import { WalletUtils } from "~utils/wallets/wallets.utils";

export function RestoreShardsEmbeddedView() {
  const { addWallet } = useAuth();

  const handleRestore = async () => {
    // TODO: arAonnectRecoveryFile should be uploaded by the user and should probably contain recovery shares for all
    // wallets. In this case, how do we pick which one to use?

    // TODO: This changes a bit if we use a 2/3 SSS with a recoveryDeviceShare:

    const { walletAddress, recoveryShare } = recoveryShareFile;

    const recoveryShareJWT = WalletUtils.generateShareJWK(recoveryShare);
    const recoverySharePublicKey = recoveryShareJWT.n;

    const { recoveryChallenge, rotateChallenge } =
      WalletService.initiateWalletRecovery(
        walletAddress,
        recoverySharePublicKey
      );

    const recoveryChallengeSignature = WalletUtils.generateChallengeSignature(
      recoveryChallenge,
      recoveryShareJWT
    );

    const authRecoveryShare = WalletService.resolveRecoveryChallenge(
      recoveryChallengeSignature
    );

    const oldDeviceNonce = WalletUtils.getDeviceNonce();
    const newDeviceNonce = WalletUtils.generateDeviceNonce();

    const jwk = await WalletUtils.generateWalletJWKFromShares(walletAddress, [
      authRecoveryShare,
      recoveryShare
    ]);

    const { authShare, deviceShare } =
      await WalletUtils.generateWalletWorkShares(jwk);

    const rotateChallengeSignature =
      await WalletUtils.generateChallengeSignature(rotateChallenge, jwk);

    // TODO: This wallet needs to be regenerated as well and the authShare updated. If this is not done after X
    // "warnings", the Shards entry will be removed anyway.
    await WalletService.rotateAuthShare({
      walletAddress,
      oldDeviceNonce,
      newDeviceNonce,
      authShare,
      challengeSignature: rotateChallengeSignature
    });

    WalletUtils.storeDeviceNonce(newDeviceNonce);
    WalletUtils.storeDeviceShare(deviceShare, walletAddress);

    addWallet(jwk);
  };

  return (
    <div>
      <h3>Restore Shards</h3>
      <p>...</p>
      <button onClick={handleRestore}>Restore</button>
    </div>
  );
}
