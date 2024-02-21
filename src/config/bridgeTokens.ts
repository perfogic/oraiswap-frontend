import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';
import { chainInfos } from './chainInfos';
import { TokenItemType, getTokensFromNetwork, oraichainNetwork } from '@oraichain/oraidex-common';

// other chains, oraichain
const otherChainTokens = flatten(
  chainInfos.filter((chainInfo) => chainInfo.chainId !== 'Oraichain').map(getTokensFromNetwork)
);
export const oraichainTokens: TokenItemType[] = getTokensFromNetwork(oraichainNetwork);

export const tokens = [otherChainTokens, oraichainTokens];
export const flattenTokens = flatten(tokens);
export const tokenMap = Object.fromEntries(flattenTokens.map((c) => [c.denom, c]));
export const assetInfoMap = Object.fromEntries(flattenTokens.map((c) => [c.contractAddress || c.denom, c]));
export const cosmosTokens = uniqBy(
  flattenTokens.filter(
    (token) =>
      // !token.contractAddress &&
      token.denom && token.cosmosBased && token.coinGeckoId
  ),
  (c) => c.denom
);

export const cw20Tokens = uniqBy(
  cosmosTokens.filter(
    // filter cosmos based tokens to collect tokens that have contract addresses
    (token) =>
      // !token.contractAddress &&
      token.contractAddress
  ),
  (c) => c.denom
);

export const cw20TokenMap = Object.fromEntries(cw20Tokens.map((c) => [c.contractAddress, c]));

export const evmTokens = uniqBy(
  flattenTokens.filter(
    (token) =>
      // !token.contractAddress &&
      token.denom && !token.cosmosBased && token.coinGeckoId && token.chainId !== 'kawaii_6886-1'
  ),
  (c) => c.denom
);

const notAllowSwapCoingeckoIds = ['kawaii-islands', 'milky-token', 'injective-protocol'];
// universal swap. Currently we dont support from tokens that are not using the ibc wasm channel
const notAllowSwapFromChainIds = [
  'kawaii_6886-1',
  'osmosis-1',
  'cosmoshub-4',
  'oraibridge-subnet-2',
  'injective-1',
  'noble-1',
  'Neutaro-1'
];
export const swapFromTokens = flattenTokens.filter(
  (token) => !notAllowSwapCoingeckoIds.includes(token.coinGeckoId) && !notAllowSwapFromChainIds.includes(token.chainId)
);
// universal swap. We dont support kwt & milky & injective for simplicity. We also skip OraiBridge tokens because users dont care about them
const notAllowSwapToChainIds = ['oraibridge-subnet-2', 'injective-1', 'noble-1', 'Neutaro-1'];
export const swapToTokens = flattenTokens.filter(
  (token) => !notAllowSwapCoingeckoIds.includes(token.coinGeckoId) && !notAllowSwapToChainIds.includes(token.chainId)
);
