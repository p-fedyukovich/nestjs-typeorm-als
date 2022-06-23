import { SinonSpy } from 'sinon';

export function expectTransactionCount(
  spies: SinonSpy[],
  expectedCount: number,
): void {
  const result = spies.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.callCount;
  }, 0);

  expect(result).toEqual(expectedCount);
}
