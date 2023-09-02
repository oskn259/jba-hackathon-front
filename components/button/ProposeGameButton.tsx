import { BigNumber } from 'ethers';
import {useCallback, useState} from 'react';
import { Button } from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
} from '@chakra-ui/react';
import { LoadingOverlay } from '../layout/LoadingOverlay';

export const ProposeGameButton: React.FC<{ isDisabled: boolean, proposeGame: (amount: BigNumber) => Promise<void> }> = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  const onPropose = useCallback(async () => {
    setIsLoading(true);
    await props.proposeGame(BigNumber.from(amount));
    setIsModalOpen(false);
    setIsLoading(false);
  }, [props.proposeGame, amount]);

  return (
    <>
      <Button
        isDisabled={props.isDisabled}
        colorScheme='blue'
        onClick={() => setIsModalOpen(true)}
      >ゲームを募集</Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ゲームを募集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder='軍資金（10000以上）' onChange={v => setAmount(v.target.value)} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onPropose} isLoading={isLoading}>
              募集
            </Button>
            <Button variant='ghost' onClick={() => setIsModalOpen(false)}>やめる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <LoadingOverlay display={isLoading}>
        <div style={{ textAlign: 'center' }}>
          ゲームの募集を作成します。<br/>
          ウォレットからトランザクションを承認してください。
        </div>
      </LoadingOverlay>
    </>
  );
}
