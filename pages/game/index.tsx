import { NextPage } from "next";
import React, {useCallback, useMemo, useState} from 'react';
import { clone } from 'ramda';
import {useContract, useContractRead, useContractWrite} from "@thirdweb-dev/react";
import { Grid, GridItem, VStack } from '@chakra-ui/react';
import { Center } from '@chakra-ui/react'

import { useLocalStorage } from '../../logics/useLocalStorage';
import { LoadingOverlay } from '../../components/layout/LoadingOverlay';
import { Cell } from '../../components/page/game/Cell';
import { SoldierMoveForm } from '../../components/page/game/SoldierMoveForm';
import {ClaimRewardButton} from '../../components/button/ClaimRewardButton';
import {BigNumber} from 'ethers';

type Category = 'hiyoko' | 'kirin' | 'lion' | 'zou' | 'niwatori';
type Area = {
  soldier: {
    id: string;
    category: Category;
    party: 'host' | 'challenger';
  } | null;
};

const categoryMap: Record<number, Category> = {
  0: 'lion',
  1: 'hiyoko',
  2: 'kirin',
  3: 'zou',
  4: 'niwatori',
}

const turnMap: Record<number, 'host' | 'challenger'> = {
  0: 'host',
  1: 'challenger',
}

const categoryGraphic: Record<Category, string> = {
  'lion': '🦁',
  'hiyoko': '🐥',
  'kirin': '🦒',
  'zou': '🐘',
  'niwatori': '🐓',
}

const GamePage: NextPage = () => {
  const boardId = useLocalStorage('boardId');
  const isHostString = useLocalStorage('isHost');

  const jgkShougi = useContract(process.env.NEXT_PUBLIC_JGKSHOUGI_CONTRACT_ADDR);
  const getBoard = useContractRead(jgkShougi.contract, 'getBoard', [boardId.value]);
  const moveSoldier = useContractWrite(jgkShougi.contract, 'moveSoldier');
  const claimLoots = useContractWrite(jgkShougi.contract, 'claimLoots');

  const ally = useMemo(() => {
    if (!getBoard.data) return null;
    return isHostString.value === 'true' ? getBoard.data.hostArmy.soldiers : getBoard.data.challengerArmy.soldiers;
  }, [getBoard.data, isHostString.value]);
  const enemy = useMemo(() => {
    if (!getBoard.data) return null;
    return isHostString.value === 'true' ? getBoard.data.challengerArmy.soldiers : getBoard.data.hostArmy.soldiers;
  }, [getBoard.data, isHostString.value]);

  const [selectedSoldier, setSelectedSoldier] = useState<{ id: string, x: number, y: number } | null>(null);

  const boardMatrix = useMemo(() => {
    if (!getBoard.data) return null;

    const empty: Area = { soldier: null };

    // 棋譜での座標表現は右上が原点なので、それに合わせていることに注意
    const matrix: Area[][] = [
      [clone(empty), clone(empty), clone(empty), clone(empty)],
      [clone(empty), clone(empty), clone(empty), clone(empty)],
      [clone(empty), clone(empty), clone(empty), clone(empty)],
    ];

    ally
      .filter(soldier => soldier.status === 0)
      .forEach(soldier => {
        const category = categoryMap[soldier.category];
        matrix[soldier.x - 1][soldier.y - 1] = {
          soldier: {
            id: soldier.id,
            category,
            party: isHostString.value === 'true' ? 'host' : 'challenger',
          }
        };
      });

    enemy
      .filter(soldier => soldier.status === 0)
      .forEach(soldier => {
        const category = categoryMap[soldier.category];
        matrix[soldier.x - 1][soldier.y - 1] = {
          soldier: {
            id: soldier.id,
            category,
            party: isHostString.value === 'true' ? 'challenger' : 'host',
          }
        };
      });

    return matrix;
  }, [getBoard.data]);

  const onClickCell = useCallback((x: number, y: number) => {
    const soldier = boardMatrix ? boardMatrix[x][y].soldier : undefined;
    if (!soldier) return;

    const turn = turnMap[getBoard.data.turn];
    const isMyTurn = isHostString.value === 'true' ? turn === 'host' : turn === 'challenger'
    if (!isMyTurn) return;

    if (soldier.party !== turn) return;

    const s = ally.find(s => (s.x - 1) === x && (s.y - 1) === y);
    setSelectedSoldier(s);
  }, [boardMatrix, getBoard.data, isHostString.value]);

  const onClickMove = useCallback(async (soldierId: string, x: number, y: number) => {
    await moveSoldier.mutateAsync({
      args: [boardId.value, soldierId, x, y],
      overrides: { value: Math.ceil(getBoard.data.stakeAmount * 0.005) }
    });
  }, [moveSoldier, boardId.value]);

  const onClaimLoots = useCallback(async (boardId: BigNumber) => {
    await claimLoots.mutateAsync({ args: [boardId] });
  }, [claimLoots]);

  if (!boardId.value || !isHostString.value) return null;

  if (getBoard.isLoading) return <LoadingOverlay display />;
  if (!getBoard.data) return null;

  const icon = (x: number, y: number) => {
    if (!boardMatrix) return null;
    const soldier = boardMatrix[x][y].soldier;
    if (!soldier) return null;
    return categoryGraphic[soldier.category];
  }

  const isSelected = (x: number, y: number) => !!selectedSoldier && selectedSoldier.x === (x + 1) && selectedSoldier.y === (y + 1);
  return (
    <main>
      <Center>
        <VStack>
          <VStack>
            <p>対戦ID：{boardId.value}</p>
            <p>Your role：{isHostString.value === 'true' ? 'Host' : 'Challenger'}</p>
            <p>Turn：{getBoard.data.turn === 1 ? 'Challenger' : 'Host'}</p>
            <p>Bounty：{getBoard.data.stakeAmount.toNumber()}</p>
            {getBoard.data.status === 2 && <p>Game finished</p>}
          </VStack>

          <Grid
            w='200px'
            h='200px'
            marginBottom='6'
            templateRows='repeat(5, 1fr)'
            templateColumns='repeat(4, 1fr)'
            gap={4}
          >
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>3</Center>
            </GridItem>
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>2</Center>
            </GridItem>
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>1</Center>
            </GridItem>
            <GridItem position='relative' rowSpan={1} colSpan={1}></GridItem>

            <Cell x={2} y={0} bg={'orange'} selected={isSelected(2, 0)} onClick={() => onClickCell(2, 0)}>{icon(2, 0)}</Cell>
            <Cell x={1} y={0} bg={'orange'} selected={isSelected(1, 0)} onClick={() => onClickCell(1, 0)}>{icon(1, 0)}</Cell>
            <Cell x={0} y={0} bg={'orange'} selected={isSelected(0, 0)} onClick={() => onClickCell(0, 0)}>{icon(0, 0)}</Cell>
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>1</Center>
            </GridItem>

            <Cell x={2} y={1} bg={'lightgreen'} selected={isSelected(2, 1)} onClick={() => onClickCell(2, 1)}>{icon(2, 1)}</Cell>
            <Cell x={1} y={1} bg={'lightgreen'} selected={isSelected(1, 1)} onClick={() => onClickCell(1, 1)}>{icon(1, 1)}</Cell>
            <Cell x={0} y={1} bg={'lightgreen'} selected={isSelected(0, 1)} onClick={() => onClickCell(0, 1)}>{icon(0, 1)}</Cell>
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>2</Center>
            </GridItem>

            <Cell x={2} y={2} bg={'lightgreen'} selected={isSelected(2, 2)} onClick={() => onClickCell(2, 2)}>{icon(2, 2)}</Cell>
            <Cell x={1} y={2} bg={'lightgreen'} selected={isSelected(1, 2)} onClick={() => onClickCell(1, 2)}>{icon(1, 2)}</Cell>
            <Cell x={0} y={2} bg={'lightgreen'} selected={isSelected(0, 2)} onClick={() => onClickCell(0, 2)}>{icon(0, 2)}</Cell>
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>3</Center>
            </GridItem>

            <Cell x={2} y={3} bg={'orange'} selected={isSelected(2, 3)} onClick={() => onClickCell(2, 3)}>{icon(2, 3)}</Cell>
            <Cell x={1} y={3} bg={'orange'} selected={isSelected(1, 3)} onClick={() => onClickCell(1, 3)}>{icon(1, 3)}</Cell>
            <Cell x={0} y={3} bg={'orange'} selected={isSelected(0, 3)} onClick={() => onClickCell(0, 3)}>{icon(0, 3)}</Cell>
            <GridItem position='relative' rowSpan={1} colSpan={1}>
              <Center style={{ position: 'absolute', width: '100%', height: '100%' }}>4</Center>
            </GridItem>
          </Grid>

          <SoldierMoveForm soldierId={selectedSoldier?.id ?? null} onClick={onClickMove} />
          <ClaimRewardButton boardId={boardId.value} claimLoot={onClaimLoots} />
        </VStack>
      </Center>
    </main>
  );
};

export default GamePage;
