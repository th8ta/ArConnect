import { useContext } from "react";
import { AuthContext } from "~utils/authentication/authentication.provider";

export function useAuth() {
  return useContext(AuthContext);
}
