import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Amplify } from "aws-amplify";
import awsConfigure from "../src/aws-exports"

Amplify.configure(awsConfigure);

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
