import type { AppProps } from "next/app";
import { ChakraProvider } from '@chakra-ui/react'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { Mumbai } from '@thirdweb-dev/chains';
import { ConnectWallet } from "@thirdweb-dev/react";
import { Heading } from '@chakra-ui/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <ThirdwebProvider
        clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
        activeChain={Mumbai}
      >
        <Heading p={4}>
          <ConnectWallet
            dropdownPosition={{
              side: "bottom",
              align: "center",
            }}
          />
        </Heading>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </ChakraProvider>
  );
}

export default MyApp;
