import { useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import { login } from "../api";
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
  Text,
} from "@chakra-ui/react";

export async function loader() {
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    return redirect("/");
  }

  return null;
}

type PageState = "credentials" | "otp";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [state, setState] = useState<PageState>("credentials");
  const navigate = useNavigate();

  const handleContinue: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    setState("otp");
  };

  const handleLogin: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const submit = async () => {
      const data = await login(email, password, otp);
      if (data.token) {
        setSession(data.token);
      }
      navigate("/");
    };

    submit();
  };

  return (
    <Layout>
      <Card w={390} p={4}>
        {state === "credentials" && (
          <form method="post" onSubmit={handleContinue}>
            <CardHeader>
              <Heading as="h2" size="lg">
                Login
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
                  <Button
                    type="submit"
                    colorScheme="teal"
                    disabled={!email || !password}
                    w="full"
                  >
                    Continue
                  </Button>
                </GridItem>
                <GridItem textAlign="center">
                  <Link to="/register">Don&apos;t have an account?</Link>
                </GridItem>
              </Grid>
            </CardBody>
          </form>
        )}
        {state === "otp" && (
          <form method="post" onSubmit={handleLogin}>
            <CardHeader>
              <Heading as="h2" size="lg">
                2-Step Authentication
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid gap={4}>
                <GridItem>
                  <Text>
                    Use the OTP code generator set up during registration to log
                    in.
                  </Text>
                </GridItem>
                <GridItem>
                  <Input
                    type="otp"
                    name="otp"
                    placeholder="OTP Code"
                    value={otp}
                    onChange={(e) => setOtp(e.currentTarget.value)}
                  />
                </GridItem>
                <GridItem>
                  <Button colorScheme="teal" type="submit" w="full">
                    Sign in
                  </Button>
                </GridItem>
                <GridItem textAlign="center">
                  <Link to="/register">Don&apos;t have an account?</Link>
                </GridItem>
              </Grid>
            </CardBody>
          </form>
        )}
      </Card>
    </Layout>
  );
}
