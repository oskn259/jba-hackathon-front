import { BigNumber } from 'ethers';
import {useCallback, useState} from 'react';
import { Button } from '@chakra-ui/react'
import { useErrorToast } from '../popup/useErrorToast';
import { LoadingOverlay } from '../layout/LoadingOverlay';

export const ClaimRewardButton: React.FC<{ boardId: string, claimLoot: (boardId: BigNumber) => Promise<void> }> = props => {
  const errorToast = useErrorToast();

  const [isLoading, setIsLoading] = useState(false);

  const onClick = useCallback(async () => {
    setIsLoading(true);
    await props.claimLoot(BigNumber.from(props.boardId))
      .catch(e => {
        errorToast({title: '賞金取得に失敗しました'});
      });
    setIsLoading(false);
  }, [props.boardId, props.claimLoot]);

  return (
    <>
      <Button
        colorScheme='blue'
        onClick={onClick}
      >賞金を獲得</Button>

      <LoadingOverlay display={isLoading}>
        <div style={{ textAlign: 'center' }}>
          賞金取得を申請しています。<br/>
          ウォレットからトランザクションを承認してください。<br/>
          決着がついていない、敗者である場合は失敗します。
        </div>
      </LoadingOverlay>
    </>
  );
}
