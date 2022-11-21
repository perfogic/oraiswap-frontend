/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.20.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee, Coin } from "@cosmjs/amino";
import {Uint128, Logo, EmbeddedLogo, Binary, Cw20Coin, InstantiateMarketingInfo, Expiration, Timestamp, Uint64, AllowanceInfo, SpenderAllowanceInfo, LogoInfo, Addr} from "./types";
import {InstantiateMsg, MinterResponse, ExecuteMsg, QueryMsg, AllAccountsResponse, AllAllowancesResponse, AllSpenderAllowancesResponse, AllowanceResponse, BalanceResponse, DownloadLogoResponse, MarketingInfoResponse, TokenInfoResponse} from "./OraiswapToken.types";
import { OraiswapTokenQueryClient, OraiswapTokenClient } from "./OraiswapToken.client";
export interface OraiswapTokenReactQuery<TResponse, TData = TResponse> {
  client: OraiswapTokenQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface OraiswapTokenDownloadLogoQuery<TData> extends OraiswapTokenReactQuery<DownloadLogoResponse, TData> {}
export function useOraiswapTokenDownloadLogoQuery<TData = DownloadLogoResponse>({
  client,
  options
}: OraiswapTokenDownloadLogoQuery<TData>) {
  return useQuery<DownloadLogoResponse, Error, TData>(["oraiswapTokenDownloadLogo", client?.contractAddress], () => client ? client.downloadLogo() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenMarketingInfoQuery<TData> extends OraiswapTokenReactQuery<MarketingInfoResponse, TData> {}
export function useOraiswapTokenMarketingInfoQuery<TData = MarketingInfoResponse>({
  client,
  options
}: OraiswapTokenMarketingInfoQuery<TData>) {
  return useQuery<MarketingInfoResponse, Error, TData>(["oraiswapTokenMarketingInfo", client?.contractAddress], () => client ? client.marketingInfo() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenAllAccountsQuery<TData> extends OraiswapTokenReactQuery<AllAccountsResponse, TData> {
  args: {
    limit?: number;
    startAfter?: string;
  };
}
export function useOraiswapTokenAllAccountsQuery<TData = AllAccountsResponse>({
  client,
  args,
  options
}: OraiswapTokenAllAccountsQuery<TData>) {
  return useQuery<AllAccountsResponse, Error, TData>(["oraiswapTokenAllAccounts", client?.contractAddress, JSON.stringify(args)], () => client ? client.allAccounts({
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenAllSpenderAllowancesQuery<TData> extends OraiswapTokenReactQuery<AllSpenderAllowancesResponse, TData> {
  args: {
    limit?: number;
    spender: string;
    startAfter?: string;
  };
}
export function useOraiswapTokenAllSpenderAllowancesQuery<TData = AllSpenderAllowancesResponse>({
  client,
  args,
  options
}: OraiswapTokenAllSpenderAllowancesQuery<TData>) {
  return useQuery<AllSpenderAllowancesResponse, Error, TData>(["oraiswapTokenAllSpenderAllowances", client?.contractAddress, JSON.stringify(args)], () => client ? client.allSpenderAllowances({
    limit: args.limit,
    spender: args.spender,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenAllAllowancesQuery<TData> extends OraiswapTokenReactQuery<AllAllowancesResponse, TData> {
  args: {
    limit?: number;
    owner: string;
    startAfter?: string;
  };
}
export function useOraiswapTokenAllAllowancesQuery<TData = AllAllowancesResponse>({
  client,
  args,
  options
}: OraiswapTokenAllAllowancesQuery<TData>) {
  return useQuery<AllAllowancesResponse, Error, TData>(["oraiswapTokenAllAllowances", client?.contractAddress, JSON.stringify(args)], () => client ? client.allAllowances({
    limit: args.limit,
    owner: args.owner,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenAllowanceQuery<TData> extends OraiswapTokenReactQuery<AllowanceResponse, TData> {
  args: {
    owner: string;
    spender: string;
  };
}
export function useOraiswapTokenAllowanceQuery<TData = AllowanceResponse>({
  client,
  args,
  options
}: OraiswapTokenAllowanceQuery<TData>) {
  return useQuery<AllowanceResponse, Error, TData>(["oraiswapTokenAllowance", client?.contractAddress, JSON.stringify(args)], () => client ? client.allowance({
    owner: args.owner,
    spender: args.spender
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenMinterQuery<TData> extends OraiswapTokenReactQuery<MinterResponse, TData> {}
export function useOraiswapTokenMinterQuery<TData = MinterResponse>({
  client,
  options
}: OraiswapTokenMinterQuery<TData>) {
  return useQuery<MinterResponse, Error, TData>(["oraiswapTokenMinter", client?.contractAddress], () => client ? client.minter() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenTokenInfoQuery<TData> extends OraiswapTokenReactQuery<TokenInfoResponse, TData> {}
export function useOraiswapTokenTokenInfoQuery<TData = TokenInfoResponse>({
  client,
  options
}: OraiswapTokenTokenInfoQuery<TData>) {
  return useQuery<TokenInfoResponse, Error, TData>(["oraiswapTokenTokenInfo", client?.contractAddress], () => client ? client.tokenInfo() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenBalanceQuery<TData> extends OraiswapTokenReactQuery<BalanceResponse, TData> {
  args: {
    address: string;
  };
}
export function useOraiswapTokenBalanceQuery<TData = BalanceResponse>({
  client,
  args,
  options
}: OraiswapTokenBalanceQuery<TData>) {
  return useQuery<BalanceResponse, Error, TData>(["oraiswapTokenBalance", client?.contractAddress, JSON.stringify(args)], () => client ? client.balance({
    address: args.address
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface OraiswapTokenUploadLogoMutation {
  client: OraiswapTokenClient;
  msg: Logo;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenUploadLogoMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenUploadLogoMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenUploadLogoMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.uploadLogo(msg, fee, memo, funds), options);
}
export interface OraiswapTokenUpdateMarketingMutation {
  client: OraiswapTokenClient;
  msg: {
    description?: string;
    marketing?: string;
    project?: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenUpdateMarketingMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenUpdateMarketingMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenUpdateMarketingMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateMarketing(msg, fee, memo, funds), options);
}
export interface OraiswapTokenUpdateMinterMutation {
  client: OraiswapTokenClient;
  msg: {
    newMinter?: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenUpdateMinterMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenUpdateMinterMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenUpdateMinterMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateMinter(msg, fee, memo, funds), options);
}
export interface OraiswapTokenMintMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    recipient: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenMintMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenMintMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenMintMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.mint(msg, fee, memo, funds), options);
}
export interface OraiswapTokenBurnFromMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    owner: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenBurnFromMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenBurnFromMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenBurnFromMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.burnFrom(msg, fee, memo, funds), options);
}
export interface OraiswapTokenSendFromMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    contract: string;
    msg: Binary;
    owner: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenSendFromMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenSendFromMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenSendFromMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.sendFrom(msg, fee, memo, funds), options);
}
export interface OraiswapTokenTransferFromMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    owner: string;
    recipient: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenTransferFromMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenTransferFromMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenTransferFromMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.transferFrom(msg, fee, memo, funds), options);
}
export interface OraiswapTokenDecreaseAllowanceMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    expires?: Expiration;
    spender: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenDecreaseAllowanceMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenDecreaseAllowanceMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenDecreaseAllowanceMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.decreaseAllowance(msg, fee, memo, funds), options);
}
export interface OraiswapTokenIncreaseAllowanceMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    expires?: Expiration;
    spender: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenIncreaseAllowanceMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenIncreaseAllowanceMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenIncreaseAllowanceMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.increaseAllowance(msg, fee, memo, funds), options);
}
export interface OraiswapTokenSendMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    contract: string;
    msg: Binary;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenSendMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenSendMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenSendMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.send(msg, fee, memo, funds), options);
}
export interface OraiswapTokenBurnMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenBurnMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenBurnMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenBurnMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.burn(msg, fee, memo, funds), options);
}
export interface OraiswapTokenTransferMutation {
  client: OraiswapTokenClient;
  msg: {
    amount: Uint128;
    recipient: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useOraiswapTokenTransferMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, OraiswapTokenTransferMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, OraiswapTokenTransferMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.transfer(msg, fee, memo, funds), options);
}