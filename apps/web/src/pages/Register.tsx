import { useState } from "react";
import { generateSecret, register } from "../api";
import { Link, redirect, useNavigate } from "react-router-dom";
import { setSession } from "../utils/session";
import Layout from "../components/Layout";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Input,
  Button,
  Grid,
  GridItem,
  Flex,
  Text,
} from "@chakra-ui/react";

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    return redirect("/");
  }

  return null;
}

type PageState = "credentials" | "qr";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [qr, setQr] = useState("");
  const [twoFactorSectet, setTwoFactorSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [state, setState] = useState<PageState>("credentials");
  const navigate = useNavigate();

  const secretGenerated = Boolean(qr && twoFactorSectet);

  const handleGenerateSecret: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (secretGenerated) {
      return;
    }

    const submit = async () => {
      const data = await generateSecret(email, password);
      setQr(data.qrCodeUrl);
      setTwoFactorSecret(data.twoFactorSecret);
      setState("qr");
    };

    submit();
  };

  const handleRegister: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const submit = async () => {
      const data = await register(email, password, otp, twoFactorSectet);
      if (data.token) {
        setSession(data.token);
        navigate("/");
      }
    };

    submit();
  };
  return (
    <Layout>
      <Card w={390} p={4}>
        {state === "credentials" && (
          <form method="post" onSubmit={handleGenerateSecret}>
            <CardHeader>
              <Heading as="h2" size="lg">
                Register
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid gap={4}>
                <GridItem>
                  <Input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                  />
                </GridItem>
                <GridItem>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                  />
                </GridItem>
                <GridItem>
                  <Button type="submit" colorScheme="teal" w="full">
                    Generate QR code
                  </Button>
                </GridItem>
                <GridItem textAlign="center">
                  <Link to="/login">Already have an account?</Link>
                </GridItem>
              </Grid>
            </CardBody>
          </form>
        )}
        {state === "qr" && (
          <form method="post" onSubmit={handleRegister}>
            <CardHeader>
              <Heading as="h2" size="lg">
                2-Step Authentication
              </Heading>
            </CardHeader>
            <Grid gap="4">
              <GridItem>
                <Text>
                  Scan this QR code with Google Authenticator app to setup the
                  OTP codes.
                </Text>
              </GridItem>
              <GridItem textAlign="center">
                <Flex justifyContent={"center"}>
                  <img src={qr} />
                </Flex>
              </GridItem>
              <GridItem>
                <Text>Use one of the codes to register.</Text>
              </GridItem>
              <GridItem>
                <Input
                  type="text"
                  name="otp"
                  placeholder="OTP Code"
                  value={otp}
                  onChange={(e) => setOtp(e.currentTarget.value)}
                />
              </GridItem>
              <GridItem>
                <Button type="submit" colorScheme="teal" w="full">
                  Register
                </Button>
              </GridItem>
              <GridItem textAlign="center">
                <Link to="/login">Already have an account?</Link>
              </GridItem>
            </Grid>
          </form>
        )}
      </Card>
    </Layout>
  );
}
