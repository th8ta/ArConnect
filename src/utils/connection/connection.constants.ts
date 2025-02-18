// TODO: replace once gateway settings are implemented
const gateways: Record<string, string>[] = [
  {
    host: "arweave.net",
    protocol: "https"
  },
  {
    host: "ar-io.net",
    protocol: "https"
  },
  {
    host: "arweave.dev",
    protocol: "https"
  },
  {
    host: "g8way.io",
    protocol: "https"
  },
  {
    host: "arweave.ar",
    protocol: "https"
  },
  {
    host: "ar-io.dev",
    protocol: "https"
  },
  {
    host: "permagate.io",
    protocol: "https"
  },
  {
    host: "defi.ao",
    protocol: "https"
  },
  {
    host: "aoweave.tech",
    protocol: "https"
  }
];

const apps = ["dexi"];

export const keepConnectionUrls = apps
  .map((app) =>
    gateways.map((gateway) => `${gateway.protocol}://${app}.${gateway.host}`)
  )
  .flat();
