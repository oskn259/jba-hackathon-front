import { useToast } from '@chakra-ui/react'

type Params = Parameters<typeof useToast>[0];

export const useErrorToast = (params: Params = {}) => {
  const defaultParams: Params = {
    position: 'top',
    title: 'error',
    status: 'error',
    containerStyle: {
      width: '800px',
      maxWidth: '100%',
    },
    isClosable: true,
  };

  return useToast({
    ...defaultParams,
    ...params
  });
}
