export type vault = vaultWithoutUnderlying & {
  underlying: string,
};

export type vaultWithoutUnderlying = {
  owner: string,
  oTokensIssued: string,
  collateral: string,
}

export type vaultWithRatio = vaultWithoutUnderlying & {
  ratio: number;
  useCollateral: boolean;
  isSafe: boolean;
}
