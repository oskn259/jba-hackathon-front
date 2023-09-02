import React from 'react';
import { GridItem } from '@chakra-ui/react';
import { Center } from '@chakra-ui/react'

export const Cell: React.FC<{
  x: number,
  y: number,
  bg: 'orange' | 'lightgreen',
  selected: boolean,
  onClick: (x: number, y: number) => void,
  children: React.ReactNode,
}> = props => {
  return (
    <GridItem position={'relative'} rowSpan={1} colSpan={1} bg={props.bg} onClick={() => props.onClick(props.x, props.y)}>
      <Center style={{ position: 'absolute', width: '100%', height: '100%' }} borderWidth={props.selected ? 'thick' : 'none'} borderColor='red'>
        {props.children}
      </Center>
    </GridItem>
  );
};
