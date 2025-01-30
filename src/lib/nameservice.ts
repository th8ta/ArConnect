import { useEffect, useState } from "react";
import type { NameServiceProfile } from "./types";
import { getAnsNameServiceProfile } from "./ans";
import { getArNSProfile } from "./arns";
import { ExtensionStorage } from "~utils/storage";

let IN_MEM_CACHE: Record<string, NameServiceProfile> = {};

async function updateCache() {
  for (const walletAddress of Object.keys(IN_MEM_CACHE)) {
    const profile =
      (await getArNSProfile(walletAddress)) ||
      (await getAnsNameServiceProfile(walletAddress));
    IN_MEM_CACHE[walletAddress] = profile;
  }
  ExtensionStorage.set("name_service_cache", IN_MEM_CACHE);
}

ExtensionStorage.get<Record<string, NameServiceProfile>>("name_service_cache")
  .then((cache) => {
    if (cache) {
      IN_MEM_CACHE = cache;
    }

    // update cache every 2 minutes
    // TODO: make this more robust
    updateCache();
    setInterval(updateCache, 2 * 60 * 1000);
  })
  .catch((e) => {
    console.error(e);
  });

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
  const cached = IN_MEM_CACHE[walletAddress];
  if (cached) {
    return cached;
  }

  const profile =
    (await getArNSProfile(walletAddress)) ||
    (await getAnsNameServiceProfile(walletAddress));

  IN_MEM_CACHE[walletAddress] = profile;
  ExtensionStorage.set("name_service_cache", IN_MEM_CACHE);

  return profile;
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
