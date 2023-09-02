import { NextPage } from "next";
import { useRouter } from 'next/router';
import {BigNumber, ethers} from 'ethers';
import { useContract, useContractWrite } from "@thirdweb-dev/react";

import { useErrorToast } from '../components/popup/useErrorToast';
import { useLocalStorage } from '../logics/useLocalStorage';
import { AcceptGameButton } from '../components/button/AcceptGameButton';
import { ProposeGameButton } from '../components/button/ProposeGameButton';
import {Button} from '@chakra-ui/react';

const Home: NextPage = () => {
  const router = useRouter();

  const errorToast = useErrorToast();

  const boardId = useLocalStorage('boardId');
  const isHost = useLocalStorage('isHost');

  const jgkShougi = useContract(process.env.NEXT_PUBLIC_JGKSHOUGI_CONTRACT_ADDR);
  const proposeGame = useContractWrite(jgkShougi.contract, 'proposeGame');
  const acceptGame = useContractWrite(jgkShougi.contract, 'acceptGame');

  const propose = async (amount: BigNumber) => {
    try {
      const id = ethers.BigNumber.from(ethers.utils.randomBytes(32));
      await proposeGame.mutateAsync({ args: [id], overrides: { value: amount } });
      boardId.save(id.toString());
      isHost.save('true');
      await router.push(`/game`);
    } catch (err) {
      errorToast({ title: '対戦の作成に失敗しました' });
    }
  }

  const accept = async (id: string, amount: BigNumber) => {
    try {
      await acceptGame.mutateAsync({ args: [id], overrides: { value: amount } });
      boardId.save(id);
      isHost.save('false');
      await router.push(`/game`);
    } catch (err) {
      errorToast({ title: 'ゲームへの参加に失敗しました' });
    }
  }

  const onReset = () => {
    boardId.reset();
    isHost.reset();
  };

  return (
    <main>
      <p>Contract Address: {process.env.NEXT_PUBLIC_JGKSHOUGI_CONTRACT_ADDR}</p>
      <ProposeGameButton isDisabled={!!boardId.value} proposeGame={propose} />
      <AcceptGameButton isDisabled={!!boardId.value} acceptGame={accept} />
      <Button colorScheme='blue' onClick={onReset}>リセット</Button>
    </main>
  );
};

export default Home;
