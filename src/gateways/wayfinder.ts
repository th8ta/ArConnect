import { isValidGateway, sortGatewaysByOperatorStake } from "~lib/wayfinder";
import {
  defaultGateway,
  goldskyGateway,
  suggestedGateways,
  type Gateway
} from "./gateway";
import { useEffect, useState } from "react";
import { getGatewayCache } from "./cache";
import { getSetting } from "~settings";
import { EventType, trackEvent } from "~utils/analytics";

export const FULL_HISTORY: Requirements = { startBlock: 0 };

export const STAKED_GQL_FULL_HISTORY: Requirements = {
  startBlock: 0,
  graphql: true,
  ensureStake: true
};

export async function findGateway(
  requirements: Requirements
): Promise<Gateway> {
  // Get if the Wayfinder feature is enabled:
  const wayfinderEnabled = await getSetting("wayfinder").getValue();

  // This should have been loaded into the cache by handleGatewayUpdateAlarm, but sometimes this function might run
  // before that, so in that case we fall back to the same behavior has having the Wayfinder disabled:
  const procData = await getGatewayCache();

  if (!wayfinderEnabled || !procData) {
    if (requirements.arns) {
      return {
        host: "arweave.dev",
        port: 443,
        protocol: "https"
      };
    }

    // wayfinder disabled or all the chain is needed
    if (requirements.startBlock === 0) {
      return defaultGateway;
    }

    throw new Error(
      wayfinderEnabled ? "Missing gateway cache" : "Wayfinder disabled"
    );
  }

  try {
    // this could probably be filtered out during the caching process
    const filteredGateways = procData.filter((gateway) => {
      return (
        gateway.ping.status === "success" && gateway.health.status === "success"
      );
    });
    const sortedGateways = sortGatewaysByOperatorStake(filteredGateways);
    const top10 = sortedGateways.slice(0, Math.min(10, sortedGateways.length));
    const randomIndex = Math.floor(Math.random() * top10.length);
    const selectedGateway = top10[randomIndex];

    // if requirements is empty
    if (Object.keys(requirements).length === 0) {
      await trackEvent(EventType.WAYFINDER_GATEWAY_SELECTED, {
        host: selectedGateway.settings.fqdn,
        port: selectedGateway.settings.port,
        protocol: selectedGateway.settings.protocol,
        requirements
      });

      return {
        host: selectedGateway.settings.fqdn,
        port: selectedGateway.settings.port,
        protocol: selectedGateway.settings.protocol
      };
    }

    for (let i = 0; i < top10.length; i++) {
      // TODO: if we want it to be random
      // const index = (randomIndex + i) % top10.length;
      const selectedGateway = top10[i];
      if (isValidGateway(selectedGateway, requirements)) {
        await trackEvent(EventType.WAYFINDER_GATEWAY_SELECTED, {
          host: selectedGateway.settings.fqdn,
          port: selectedGateway.settings.port,
          protocol: selectedGateway.settings.protocol,
          requirements
        });
        return {
          host: selectedGateway.settings.fqdn,
          port: selectedGateway.settings.port,
          protocol: selectedGateway.settings.protocol
        };
      }
    }
  } catch (err) {
    console.log("err", err);
  }

  return defaultGateway;
}

/**
 * Gateway hook that uses wayfinder to select the active gateway.
 */
export function useGateway(requirements: Requirements) {
  // currently active gw
  const [activeGateway, setActiveGateway] = useState<Gateway>(defaultGateway);

  useEffect(() => {
    (async () => {
      try {
        // select recommended gateway using wayfinder
        const recommended = await findGateway(requirements);

        setActiveGateway(recommended);
      } catch {}
    })();
  }, [
    requirements.graphql,
    requirements.arns,
    requirements.startBlock,
    requirements.ensureStake
  ]);

  return activeGateway;
}

export async function findGraphqlGateways(count?: number) {
  try {
    const gateways = await getGatewayCache();

    if (!gateways?.length) {
      return suggestedGateways;
    }

    const filteredGateways = gateways.filter(
      ({ ping, health }) =>
        ping.status === "success" && health.status === "success"
    );

    if (!filteredGateways.length) {
      return suggestedGateways;
    }

    return sortGatewaysByOperatorStake(filteredGateways)
      .filter((gateway: any) => gateway?.properties?.GRAPHQL)
      .slice(0, count || filteredGateways.length)
      .map(({ settings: { fqdn, port, protocol } }) => ({
        host: fqdn,
        port,
        protocol
      }));
  } catch {
    return suggestedGateways;
  }
}

export function useGraphqlGateways(count?: number) {
  const [graphqlGateways, setGraphqlGateways] = useState<Gateway[]>([]);

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const gateways = await findGraphqlGateways(count);
        const hasDefaultGateway = gateways.some(
          (g) => g.host === defaultGateway.host
        );
        const hasGoldskyGateway = gateways.some(
          (g) => g.host === goldskyGateway.host
        );

        const finalGateways = [...gateways];

        if (!hasDefaultGateway) {
          finalGateways.unshift(defaultGateway);
        }

        if (!hasGoldskyGateway) {
          const insertionIndex = Math.min(2, finalGateways.length);
          finalGateways.splice(insertionIndex, 0, goldskyGateway);
        }

        setGraphqlGateways(
          finalGateways.slice(0, count || finalGateways.length)
        );
      } catch {
        setGraphqlGateways(suggestedGateways);
      }
    };

    fetchGateways();
  }, [count]);

  return graphqlGateways;
}

export interface Requirements {
  /* Whether the gateway should support GraphQL requests */
  graphql?: boolean;
  /* Should the gateway support ArNS */
  arns?: boolean;
  /**
   * The block where the gateway should start syncing data from.
   * Set for 0 to include all blocks.
   * If undefined, wayfinder will not ensure that the start block
   * is 0.
   */
  startBlock?: number;
  /**
   * Ensure that the gateway has a high stake. This is required
   * with data that is important to be accurate. If true, wayfinder
   * will make sure that the gateway stake is higher than the
   * average stake of ar.io nodes.
   */
  ensureStake?: boolean;
}
