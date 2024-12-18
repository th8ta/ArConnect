export function isError(data: unknown): data is Error {
  return data instanceof Error;
}

/**
 * For future reference, here are some error types that can be used:
 *
 * "Not found": Something was queried/mapped/loaded but was not there.
 * "Missing": Something should have been provided/set, but wasn't.
 * "Unexpected": Something was provided, but the value wasn't right.
 *  */

export enum ErrorTypes {
  Error = "Error",
  RangeError = "RangeError",
  ReferenceError = "ReferenceError",
  SyntaxError = "SyntaxError",
  URIError = "URIError",
  PageNotFound = "Page not found",
  MissingSettingsType = "Missing settings type",
  UnexpectedSettingsType = "Unexpected settings type",
  SettingsNotFound = "Settings not found",
  WalletNotFound = "Wallet not found",
  TokenNotFound = "Token not found",
  MissingTxId = "Transaction ID not found"
}
