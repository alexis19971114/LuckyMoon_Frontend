import { ethers } from "ethers";

export const CONSTADDRESS = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  DEAD: "0x0000000000000000000000000000000000000000",
  DEAD2: "0x000000000000000000000000000000000000dead",
};

export const MAX_NUMBER = 999999999

export const SERVER_URL = "http://135.181.0.186:1114"
export const SERVER_URL2 = "http://135.181.0.186:1114"

export const printCount = 300;
export const NONCE = {
  LOW: 5,
  HIGH: 1000,
  DEVI: 5,
}

export const STAR_LIMIT = {
  SNIPERS: 30,
};

export const isLocked = (item) => {
  if (item.liquidityLockedHash !== undefined) return true;
  return false;
};

export const convertTimezone = (date) => {
//  let deviation     = 54656000
//  let deviation     = 0
  let serverDate    = Date.parse(date)
  let currentDate   = new Date(serverDate)

  const year        = currentDate.getFullYear();
  const month       = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day         = String(currentDate.getDate()).padStart(2, '0');
  const hours       = String(currentDate.getHours()).padStart(2, '0');
  const minutes     = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds     = String(currentDate.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

export const isRenounced = (item) => {
  if (
    item.renounceOwnerShipHash !== undefined ||
    item.updatedOwner === CONSTADDRESS.DEAD ||
    item.updatedOwner === CONSTADDRESS.DEAD2
  )
    return true;
  return false;
};

export const isLimitRemoved = (item) => {
  if (
    item.removeLimitsHash !== undefined ||
    item.setMaxTxAmountHash !== undefined
  )
    return true;
  return false;
};

export const sortTokens = (tokenA, tokenB) => {
  if (ethers.BigNumber.from(tokenA).lt(ethers.BigNumber.from(tokenB))) {
    return [tokenA, tokenB];
  }
  return [tokenB, tokenA];
};

export const getPairAddress = (token) => {
  if (token === undefined) return "";
  const [token0, token1] = sortTokens(token, CONSTADDRESS.WETH);

  const salt = ethers.utils.keccak256(token0 + token1.replace("0x", ""));
  const address = ethers.utils.getCreate2Address(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Factory address (contract creator)
    salt,
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f" // init code hash
  );

  return address;
};
