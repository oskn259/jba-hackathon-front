import React, {useCallback, useMemo, useState} from 'react';
import { Input, HStack } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react'

import { useErrorToast } from '../../popup/useErrorToast';
import { LoadingOverlay } from '../../layout/LoadingOverlay';

export const SoldierMoveForm: React.FC<{ soldierId: string | null, onClick: (soldierId: string, x: number, y: number) => Promise<void> }> = props => {
  const errorToast = useErrorToast();

  const [x, setX] = useState<number | null>(null);
  const [y, setY] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isDisabled = useMemo(() => x === null || y === null, [x, y]);

  const onClick = useCallback(async () => {
    if (!props.soldierId || x === null || y === null) return;
    setIsLoading(true)
    await props.onClick(props.soldierId, x, y)
      .catch(e => {
        errorToast({title: '移動に失敗しました'});
      });
    setIsLoading(false);
  }, [props.soldierId, x, y]);

  return (
    <>
      <LoadingOverlay display={isLoading}>
        <div style={{textAlign: 'center'}}>
          駒を移動させます。<br/>
          ウォレットからトランザクションを承認してください。
        </div>
      </LoadingOverlay>

      <HStack>
        <Input placeholder='x座標' width='80px' onChange={v => setX(Number(v.target.value))}/>
        <Input placeholder='y座標' width='80px' onChange={v => setY(Number(v.target.value))}/>
        <Button colorScheme='blue' mr={3} isDisabled={isDisabled} onClick={onClick}>移動</Button>
      </HStack>
    </>
  );
};
