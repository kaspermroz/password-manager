import { useRef } from "react";
import { redirect, useNavigate, useLoaderData, Form } from "react-router-dom";
import { destroySession } from "../utils/session";
import { getEncryptedPasswords, isTokenValid } from "../api";
import { copyToClipboard, decrypt } from "../utils/passwords";
import {
  Heading,
  Box,
  Flex,
  Grid,
  GridItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Text,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import useSecret from "../hooks/useSecret";

type StoredPasswords = {
  _id: string;
  hostname: string;
  username: string;
  encryptedPassword: string;
};

type LoaderData = {
  passwords: StoredPasswords[];
};

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return redirect("/login");
  }

  if (!(await isTokenValid(userToken))) {
    destroySession();
    return redirect("/login");
  }

  const passwords = await getEncryptedPasswords(userToken);

  return { passwords };
}

function App() {
  const { secret, setSecret } = useSecret();
  const navigate = useNavigate();
  const { passwords } = useLoaderData() as LoaderData;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const toast = useToast();

  const handleLogout = () => {
    destroySession();
    navigate("/login");
  };

  const handleCopy = async (
    hostname: string,
    encryptedPassword: string,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (secret) {
      const password = decrypt(encryptedPassword, secret);
      if (!password) {
        alert("Invalid secret!");
      }
      e.currentTarget.focus();
      await copyToClipboard(password);
      toast({
        title: "Password copied to clipboard",
        description: `Your password for ${hostname} has been copied to your clipboard - be careful where you paste it!`,
        status: "success",
      });
    }
  };

  const handleStoreSecret: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    setSecret(e.currentTarget.secret.value);
  };

  return (
    <Box h="100vh">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        py={4}
        px={8}
        maxW="1400"
        m="0 auto"
      >
        <Heading>Password Manager</Heading>
        <Button onClick={handleLogout}>Logout</Button>
      </Flex>
      <Divider />
      {secret ? (
        <Grid p={8} templateColumns="2fr 6fr" maxW="1400" m="0 auto">
          <GridItem>
            <Card>
              <CardHeader>
                <Heading as="h2" size="lg">
                  Hi, user!
                </Heading>
              </CardHeader>
              <CardBody>
                <Grid gap={4}>
                  <GridItem>
                    <Text>
                      You currently have {passwords.length} passwords stored
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Button colorScheme="teal" onClick={onOpen}>
                      Add password
                    </Button>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
            <Modal
              isOpen={isOpen}
              onClose={onClose}
              initialFocusRef={initialRef}
            >
              <Form method="post" action="/store-password">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Store new password</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody pb={6}>
                    <FormControl mb={4}>
                      <FormLabel>Host name</FormLabel>
                      <Input
                        name="hostname"
                        placeholder="https://www.facebook.com"
                        ref={initialRef}
                      />
                    </FormControl>
                    <FormControl mb={4}>
                      <FormLabel>User name</FormLabel>
                      <Input name="username" placeholder="test@example.com" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Input
                        name="password"
                        type="password"
                        placeholder="password"
                      />
                    </FormControl>
                    <input name="secret" type="hidden" value={secret} />
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="teal"
                      mr={3}
                      type="submit"
                      onClick={onClose}
                    >
                      Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                  </ModalFooter>
                </ModalContent>
              </Form>
            </Modal>
          </GridItem>
          <GridItem>
            <Box px={6}>
              {passwords.length ? (
                <TableContainer>
                  <Table variant="simple">
                    <TableCaption>Your stored passwords</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Host name</Th>
                        <Th>User name</Th>
                        <Th></Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {passwords.map((password) => (
                        <Tr key={password._id}>
                          <Td>{password.hostname}</Td>
                          <Td>{password.username}</Td>
                          <Td>
                            <Tooltip label="Copy to clipboard">
                              <button
                                onClick={(e) =>
                                  handleCopy(
                                    password.hostname,
                                    password.encryptedPassword,
                                    e
                                  )
                                }
                              >
                                <CopyIcon />
                              </button>
                            </Tooltip>
                          </Td>
                          <Td>
                            <Tooltip label="Delete password">
                              <Form method="post" action="/delete-password">
                                <input
                                  type="hidden"
                                  name="id"
                                  value={password._id}
                                />
                                <button
                                  type="submit"
                                  onClick={() =>
                                    toast({
                                      title: "Password deleted successfuly",
                                      status: "warning",
                                    })
                                  }
                                >
                                  <DeleteIcon />{" "}
                                </button>
                              </Form>
                            </Tooltip>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text>No stored passwords to show.</Text>
              )}
            </Box>
          </GridItem>
        </Grid>
      ) : (
        <Box p={8}>
          <Flex justifyContent="center">
            <Card w={390}>
              <CardHeader>
                <Heading as="h2" size="lg">
                  Master password
                </Heading>
              </CardHeader>
              <CardBody>
                <form method="post" onSubmit={handleStoreSecret}>
                  <Grid gap={4}>
                    <GridItem>
                      <Text>
                        This is your encryption secret. Without it you will not
                        be able to store new passwords or decode existsing ones.
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Input
                        type="password"
                        name="secret"
                        placeholder="Secret"
                      />
                    </GridItem>
                    <GridItem>
                      <Button type="submit" colorScheme="teal" w="full">
                        Store secret
                      </Button>
                    </GridItem>
                  </Grid>
                </form>
              </CardBody>
            </Card>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
export default App;
