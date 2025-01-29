import { useEffect, useState } from "react";
import type { NameServiceProfile } from "./types";
import { getAnsNameServiceProfile } from "./ans";
import { getArNSProfile } from "./arns";

/**
 * Return a NameServiceProfile for a query
 *
 * @param walletAddress Address
 *
 * @returns NameServiceProfile | undefined
 */
export async function getNameServiceProfile(
  walletAddress: string
): Promise<NameServiceProfile | undefined> {
  return (
    (await getArNSProfile(walletAddress)) ||
    (await getAnsNameServiceProfile(walletAddress))
  );
}

/**
 * Return NameServiceProfile[] for a wallet addresses
 *
 * @param walletAddress Address[]
 *
 * @returns NameServiceProfile[] | undefined
 */
export async function getNameServiceProfiles(
  walletAddress: string[]
): Promise<Array<NameServiceProfile>> {
  const profiles = [];
  for (let wallet of walletAddress) {
    const profile = await getNameServiceProfile(wallet);
    if (profile) {
      profiles.push(profile);
    }
  }
  return profiles;
}

/**
 * React hook for Nameservice (ArNS, ANS) profile
 *
 * @param walletAddress Address
 *
 * @returns NameServiceProfile | undefined
 */
export function useNameServiceProfile(walletAddress: string) {
  const [profile, setProfile] = useState<NameServiceProfile>();

  useEffect(() => {
    (async () => {
      if (!walletAddress) {
        return setProfile(undefined);
      }

      const profile = await getNameServiceProfile(walletAddress);

      setProfile(profile);
    })();
  }, [walletAddress]);

  return profile;
}
