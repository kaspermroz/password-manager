import { useContext } from "react";
import { SecretContext, ISecretContext } from "../context/secret";

export default function useSecret(): ISecretContext {
  const ctx = useContext(SecretContext);

  return ctx;
}
