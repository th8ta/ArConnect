import { DevFigmaScreen } from "~components/dev/figma-screen/figma-screen.component";
import { useEmbedded } from "~utils/embedded/embedded.hooks";
import { useRef } from "react";

import screenSrc from "url:/assets-beta/figma-screens/restore-shares.view.png";

export function AuthRestoreSharesRecoveryFileEmbeddedView() {
  const { wallets, authMethod, activateWallet } = useEmbedded();
  const walletAddress = wallets[0].address;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRestore = () => {
    const textareaElement = textareaRef.current;

    // TODO: Throw error with error message for `DevFigmaScreen` to display it:
    if (!textareaElement) return;

    // return restoreWallet(textareaRef.current.value);
  };

  /*
  const handleRestore = async () => {
    // TODO: arAonnectRecoveryFile should be uploaded by the user and should probably contain recovery shares for all
    // wallets. In this case, how do we pick which one to use?

    // TODO: This changes a bit if we use a 2/3 SSS with a recoveryDeviceShare:

    const { walletAddress, recoveryShare } = mockedRecoveryShareFileData;

    const { recoveryChallenge, rotateChallenge } =
      await WalletService.initiateWalletRecovery(walletAddress);

    const recoveryShareHash = await WalletUtils.generateShareHash(
      recoveryShare
    );

    const recoveryChallengeSignature =
      await WalletUtils.generateChallengeSignature(
        recoveryChallenge,
        recoveryShareJWT
      );

    const authRecoveryShare = await WalletService.resolveRecoveryChallenge(
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

    activateWallet(jwk);
  };
  */

  // TODO: Do we need to show a selector with the recoverable wallets or list all of them but tell the user
  // which ones can/can't be recovered (or none)? Can I get a new wallet instead?

  // This view should probably work if the user uploads a keyfile too

  return (
    <DevFigmaScreen
      title="Restore shares / wallet"
      src={screenSrc}
      config={[
        {
          // TODO: This should be a selector / dropdown and we might want to include a bulk / download all option
          label: walletAddress,
          isDisabled: true
        },
        {
          label: "Upload",
          onClick: () => alert("Not implemented")
        },
        {
          label: "Back",
          to: "/auth/restore-shares",
          variant: "secondary"
        }
      ]}
    >
      <textarea ref={textareaRef} placeholder="Upload recovery file"></textarea>
    </DevFigmaScreen>
  );
}
