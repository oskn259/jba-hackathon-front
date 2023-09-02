import { VStack, Spinner } from '@chakra-ui/react';
import { Center } from '@chakra-ui/react'
import { ReactNode } from 'react';

export const LoadingOverlay: React.FC<{ display: boolean, children?: ReactNode }> = props => {
  if (!props.display) return null;
  return (
    <Center style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 10000,
      background: '#ffffff',
      opacity: 0.8
    }}>
      <VStack spacing='24px'>
        <Spinner size="xl" />
        <div>{props.children}</div>
      </VStack>
    </Center>
  );
}
