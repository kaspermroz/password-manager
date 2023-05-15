import type { ReactNode } from "react";
import { createContext, useState } from "react";

const noop = () => {
  // noop
};

export interface ISecretContext {
  secret: string;
  setSecret: (secret: string) => void;
}

export const SecretContext = createContext<ISecretContext>({
  secret: "",
  setSecret: noop,
});

type Props = {
  children: ReactNode;
};

export function SecretProvider({ children }: Props) {
  const [secret, setSecret] = useState("");

  return (
    <SecretContext.Provider
      value={{
        secret,
        setSecret,
      }}
    >
      {children}
    </SecretContext.Provider>
  );
}
