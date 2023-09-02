import { useToast } from '@chakra-ui/react'

type Params = Parameters<typeof useToast>[0];

export const useSuccessToast = (params: Params = {}) => {
  const defaultParams: Params = {
    position: 'top',
    title: 'error',
    status: 'success',
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
