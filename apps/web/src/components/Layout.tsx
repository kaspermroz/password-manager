import { Flex } from "@chakra-ui/react";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <Flex alignItems="center" justifyContent="center" h="100vh">
      <div>{children}</div>
    </Flex>
  );
}
