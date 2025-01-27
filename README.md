# ArConnect Browser Extension & ArConnect Embedded

## Testing

### Embedded

Scenarios to test:

**New account & wallet:**

After signing up, a new account is created. Verify:

- A new wallet is generated and split with SSS.
- The wallet seedphrase is persisted encrypted in `localStorage` to allow future wallet exports as seedphrase (in this
  same device only).
- A `deviceNonce` is generated and persisted in `localStorage`.
- Its `authShare` is stored in the server
- Its `deviceShare` is persisted in `localStorage`.

**Wallet backup:**

After signing up/in, backup a wallet using the wallet recovery option, twice on the same wallet. Verify:

- The wallet we are backing is split with SSS.
- Its `recoveryAuthShare` is stored in the server.
- Its `recoveryBackupShare` is downloaded in a JSON file.
- The JSON file includes a signature from the server, that allows it to verify this file was once filed even after the
  recovery share is deleted from the DB.
- The `recoveryBackupShare` is persisted encrypted in `localStorage` to avoid re-creating new recovery shares if the
  user wants to download it again on that same device.
- Downloading the same wallet recovery option doesn't register a new recovery share on the backend, as stated above.

**Wallet activation:**

After signing in or reloading a session on an existing account a wallet should be activated:

- Initially (v0.1), the last recently used wallet with a matching `deviceShare` available will be automatically
  activated upon successful authentication.

- Later (v1.0), no wallet will be activated until the user/dApp tries to use it. At that point, it will be activated.
  After some time (TBD), it will be deactivated (removed from memory, even encrypted).

Then, verify:

- The `deviceSharePublicKey` is generated using the `deviceShare`.
- A wallet activation challenge is requested from the backend, providing the target `walletId`.
- An `authShare` is fetched after solving the server activation challenge and providing it with the `deviceNonce`.
- The wallet private key is reconstructed and stored encrypted in memory, with a randomly generated password that is
  rotated regularly (until the wallet is deactivated in v1.0)

Note: The backend should also verify when requesting or resolving activation challenges that the `deviceNonce` matches
the stored device data (ip, country, userAgent...).

**Wallet recovery (`deviceNonce` gone):**

**Wallet recovery (`deviceShare` gone):**

4A. (AR+R) Delete deviceShare. Reload. Account fetched. no authShare fetched, deviceNonce not sent (because
deviceShare is missing). Recovery screen. recoveryShare provided. authRecoveryShare fetched.
pk reconstructed. pk re-split into new deviceShare and authShare. Recovery stays the same. deviceNonce with
corresponding authShare stays on the server (we have no way to tell if it's still needed).

4B. (AR+R) Delete deviceNonce. Same as above.

5A. encrypted recoveryShare deleted. Download recoveryShard. It needs to be re-split, so a new recoveryShare -
authRecoveryShare is generated and stored.

5B. encrypted recoveryShare deleted. Download recoveryShard. It needs to be re-split, so a new recoveryShare -
authRecoveryShare is generated and stored. The backend says only 2 can be stored, so user must pick which one
to delete.

6. (DR+R) Recover account. This rare scenario happens when the user loses access to their authentication,
   but still has access to a previously used device and recoveryShare.
   recoveryShare provided. pk reconstructed. Challenge signature sent. Old auth methods
   cleared. New one added. pk re-split. deviceNonce, authShare and deviceShare generated.

7 (DR + AR) Recover account. This rare scenario happens when the user has access to a previously used device that
somehow lost the deviceShare, but not the deviceRecoveryShare, and they do not have the recovery share (so 6 and
4 not possible). This is unlikely to happen, so we could not serve AR, given DR, only given R. This just happens
to be a possibility if we go for a 2/3 SSS scheme for the recovery shares to enable DR+R.

7. (pk) Recover account. pk provided. Signature sent. Auth methods cleared. pk re-split.

8. Weird scenarios where the address is not right.
