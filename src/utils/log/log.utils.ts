export enum LOG_GROUP {
  API = "API",
  AUTH = "AUTH",
  CHUNKS = "CHUNKS",
  GATEWAYS = "GATEWAYS",
  MSG = "MSG",
  SETUP = "SETUP"
}

const LOG_GROUPS_ENABLED: Record<LOG_GROUP, boolean> = {
  [LOG_GROUP.API]: process.env.NODE_ENV === "development",
  [LOG_GROUP.AUTH]: process.env.NODE_ENV === "development",
  [LOG_GROUP.CHUNKS]: false,
  [LOG_GROUP.GATEWAYS]: false,
  [LOG_GROUP.MSG]: false,
  [LOG_GROUP.SETUP]: process.env.NODE_ENV === "development"
};

function getColor() {
  const { pathname } = location;

  if (pathname.includes("auth.html")) {
    return "color: yellow;";
  }

  return "color: inherit;";
}

export function log(logGroup: LOG_GROUP, ...args: any) {
  if (!LOG_GROUPS_ENABLED[logGroup]) return;

  const prefix =
    location.protocol === "chrome-extension:" ? "" : "[ArConnect] ";

  console.log(`${prefix}%c[${logGroup}]`, getColor(), ...args);
}
