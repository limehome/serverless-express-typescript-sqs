import { Message } from '../../src/interfaces/message.interface';

const useModifier = <T>(value: T) => (
  modifyFunc: (v: T) => void = () => {},
) => {
  const copiedValue: T = JSON.parse(JSON.stringify(value));
  modifyFunc(copiedValue);
  return copiedValue;
};

export const createMessageMock = useModifier<Message>({
  payload: 'this is a valid payload',
});
