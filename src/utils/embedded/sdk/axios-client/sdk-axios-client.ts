import axios from "axios";

const instance = axios.create({
  baseURL: "https://arconnect-embedded.com/api/"
});

const searchParams = new URLSearchParams(document.location.search);
const appApiKey = searchParams.get("API_KEY");

instance.defaults.headers["x-api-key"] = appApiKey;

export function setAuthorization(jwtString: string | null) {
  if (jwtString)
    instance.defaults.headers.Authorization = `Bearer ${jwtString}`;
  else delete instance.defaults.headers.Authorization;
}
