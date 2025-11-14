import RestClient from "./RestClient";

export async function getBoard() {
  const res = await RestClient.get("/boards");
  return res;
}
