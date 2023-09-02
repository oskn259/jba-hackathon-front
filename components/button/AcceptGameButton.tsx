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

export const AcceptGameButton: React.FC<{ isDisabled: boolean, acceptGame: (boardId: string, amount: BigNumber) => Promise<void> }> = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardId, setBoardId] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  const onAccept = useCallback(async () => {
    setIsLoading(true);
    await props.acceptGame(boardId, BigNumber.from(amount));
    setIsModalOpen(false);
    setIsLoading(false);
  }, [props.acceptGame, boardId]);

  return (
    <>
      <Button
        isDisabled={props.isDisabled}
        colorScheme='blue'
        onClick={() => setIsModalOpen(true)}
      >ゲームに参加</Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ゲームに参加</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder='対戦IDを入力' onChange={v => setBoardId(v.target.value)} />
            <Input placeholder='軍資金（10000以上）' onChange={v => setAmount(v.target.value)} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onAccept} isLoading={isLoading}>
              参加
            </Button>
            <Button variant='ghost' onClick={() => setIsModalOpen(false)}>やめる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <LoadingOverlay display={isLoading}>
        <div style={{ textAlign: 'center' }}>
          ゲームに参加します。<br/>
          ウォレットからトランザクションを承認してください。
        </div>
      </LoadingOverlay>
    </>
  );
}
