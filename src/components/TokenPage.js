import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import { BsSearch } from "react-icons/bs";
import { useSocketContext } from "./SocketIo";
import Modal from "react-bootstrap/Modal";
import toast, { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers";
import axios from "axios";
import ClipBoard from "./ClipBoard.js";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { isLocked, isRenounced, isLimitRemoved, getPairAddress } from "./utils";
import { useParams } from 'react-router-dom';
import { printCount } from "./utils";
import { SERVER_URL, SERVER_URL2 } from "./utils";
import { NONCE } from "./utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Spin } from "antd"

const TokenPage = () => {
  const { address } = useParams();

  const [tokenList, setTokenList] = useState([]);

  const navigate = useNavigate();

  const { contextValue, updateContextValue } = useSocketContext();
  const { socket, navigator, loading } = contextValue

  const [ABIModal, setABIModal] = useState(false);

  const [contractCodeModal, setContractCodeModal] = useState(false);

  const [selectedToken, setSelectedToken] = useState({});
  const [selectedSimulation, setSelectedSimulation] = useState([]);

  const [showSimulations, setShowSimulations] = useState(false);

  const [func, setFunc] = useState(0);

  const [showNormalTokens, setShowNormalTokens] = useState(true);
  const [showRemovedTokens, setShowRemovedTokens] = useState(false);
  const [showStaredTokens, setShowStaredTokens] = useState(true);
  const [showSwappedTokens, setShowSwappedTokens] = useState(false);
  const [showLockedTokens, setShowLockedTokens] = useState(false);
  const [showRenouncedTokens, setShowRenouncedTokens] = useState(false);
  const [showLimitRemovedTokens, setShowLimitRemovedTokens] = useState(false);
  const [curBlockNum, setCurBlockNum] = useState(0)
  const [sniperTxs, setSniperTxs] = useState([]);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    selectToken(address)
  }, [])
  
  useEffect(() => {
    setSniperTxs(selectedToken.sniperTxs)
  }, [selectedToken])
  
  

  const selectToken = async (address) => {
    const response = await axios({
      method: "get",
      url: `${SERVER_URL2}/api/v1/contractInfo/?address=${address}`,
    });
    let selectedTokenInfo = response.data.data;
    let contractCode = response.data.contractSourceCode;
    contractCode = contractCode ? contractCode.toLowerCase() : "";

    selectedTokenInfo.isTG = 0;
    selectedTokenInfo.isTwitter = 0;
    selectedTokenInfo.isMedium = 0;
    // if (contractCode !== "") {
    //   if (contractCode.includes("t.me")) {
    //     selectedTokenInfo.isTG = 1;
    //   }
    //   if (
    //     contractCode.includes("twitter.com") ||
    //     contractCode.includes("x.com") ||
    //     contractCode.includes("X.com")
    //   ) {
    //     selectedTokenInfo.isTwitter = 1;
    //   }
    //   if (contractCode.includes("medium.com")) {
    //     selectedTokenInfo.isMedium = 1;
    //   }

    //   const countOfCom = (contractCode.match(/\.com/g) || []).length;
    //   if (
    //     countOfCom >
    //     selectedTokenInfo.isTwitter + selectedTokenInfo.isMedium
    //   ) {
    //     selectedTokenInfo.isSite = 1;
    //   }
    //   if (
    //     contractCode.includes("web") ||
    //     contractCode.includes("www") ||
    //     // contractCode.includes(".app") ||
    //     contractCode.includes("wtf") ||
    //     contractCode.includes("xyz") ||
    //     contractCode.includes("vip") ||
    //     contractCode.includes("site") ||
    //     contractCode.includes("live")
    //   ) {
    //     selectedTokenInfo.isSite = 1;
    //   }
    // }

    selectedTokenInfo.sniperTxs = response.data.sniperTxs;
    
    setPrice(response.data.price)
    // selectedTokenInfo.BGCount = response.data.sniperTxs.BGCount;
    // selectedTokenInfo.MaestroCount = response.data.sniperTxs.MaestroCount;
    //console.log(selectedTokenInfo.sniperTxs.length);
    setSelectedToken(selectedTokenInfo);
    setCurBlockNum(
      selectedTokenInfo.firstSwapBlockNumber === undefined
      ? selectedTokenInfo.blockNumber
      : selectedTokenInfo.firstSwapBlockNumber
    )
    setSelectedSimulation(response.data.simulationInfo);
    updateContextValue({
      ...contextValue,
      loading: false,
    })
    setFunc(0);
  };

  const genText = (func, len, id, val, rate) => {
    var text = func.split("(")[0] + "(";
    for (var i = 0; i < len; i++) {
      let t = 0;
      if (i === id) {
        t = val;
      }
      if (i === 0) {
        text += t;
      } else {
        text += "," + t;
      }
    }
    return text + ") ->" + val / rate + "%";
  };

  const removeToken = async () => {
    await axios({
      method: "post",
      url: `${SERVER_URL}/api/v1/contractInfo/setTokenLevel`,
      data: { address: selectedToken.address, level: 1 },
    });
    toast(`${selectedToken.name}(${selectedToken.symbol}) is Removed. ✂`, {
      icon: "👏",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
        duration: 5000,
      },
    });
    let tempTokenList = [];
    for (let i = 0; i < tokenList.length; ++i) {
      if (tokenList[i].address === selectedToken.address) {
        selectToken(tokenList[i > 1 ? i - 1 : 0]);
      } else {
        tempTokenList.push(tokenList[i]);
      }
    }
    setTokenList(tempTokenList);
  };

  const starToken = async () => {
    await axios({
      method: "post",
      url: `${SERVER_URL}/api/v1/contractInfo/setTokenLevel`,
      data: { address: selectedToken.address, level: 2 },
    });
    toast(`${selectedToken.name}(${selectedToken.symbol}) is Stared⭐`, {
      autoClose: 5000,
      hideProgressBar: true,
    });
    let tempTokenList = [];
    for (let i = 0; i < tokenList.length; ++i) {
      let tempToken = tokenList[i];
      if (tokenList[i].address === selectedToken.address) {
        tempToken.level = 2;
      }
      tempTokenList.push(tempToken);
    }
    setTokenList(tempTokenList);
  };

  const recoverToken = async () => {
    await axios({
      method: "post",
      url: `${SERVER_URL}/api/v1/contractInfo/setTokenLevel`,
      data: { address: selectedToken.address, level: 0 },
    });
    toast(`${selectedToken.name}(${selectedToken.symbol}) is recovered.`, {
      autoClose: 5000,
      hideProgressBar: true,
    });
    let tempTokenList = [];
    for (let i = 0; i < tokenList.length; ++i) {
      let tempToken = tokenList[i];
      if (tokenList[i].address === selectedToken.address) {
        tempToken.level = 0;
      }
      tempTokenList.push(tempToken);
    }
    setTokenList(tempTokenList);
  };

  const showUnlockTime = (item) => {
    if (item.liquidityUnlockTime === undefined) return "";
    if (item.liquidityUnlockTime === 10000000000000) return "♾";
    // return "";
    const currentUnixTimeStamp = Math.floor(Date.now() / 1000);
    const lockedTimeDay = (
      (item.liquidityUnlockTime - currentUnixTimeStamp) /
      60 /
      60 /
      24
    ).toFixed(1);
    return `${lockedTimeDay}`;
  };

  const toBlock = async (blockNumber) => {
    setCurBlockNum(blockNumber)
    const response = await axios({
      method: "get",
      url: `${SERVER_URL2}/api/v1/contractInfo/txns?block=${blockNumber}&token=${address}`,
    });
    setSniperTxs(response.data.tokens)
    setPrice(response.data.price)
  }

  const resetBlockNum = () =>{
    let block = selectedToken.firstSwapBlockNumber === undefined
    ? selectedToken.blockNumber
    : selectedToken.firstSwapBlockNumber
    toBlock(block)
  }

  return (
    <div>
      {
        loading && (
          <div className="loading">
            <Spin size="large" />
          </div>
        )
      } 
      <div className="content">
        <div className="row mt-1">
          <div className="col-md-2"><h1 className="to-main mx-4 mt-2" onClick={() => {navigate('/')}}>Main Page</h1> </div>
          <div className="col-md-2 d-flex align-items-center justify-content-between">
            <label className="label-content">Name:</label>
            <div className="value-content">{selectedToken.name}</div>
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <label className="label-content">Symbol:</label>
            <div className="value-content">{selectedToken.symbol}</div>
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <label className="label-content">Contract Address:</label>
            {selectedToken.address !== undefined ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <a
                  href={`https://etherscan.io/address/${selectedToken.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedToken.address.slice(0, 10)}...
                  {selectedToken.address.slice(
                    selectedToken.address.length - 8,
                    selectedToken.address.length
                  )}
                </a>
                <ClipBoard text={selectedToken.address} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <label className="label-content">Owner Address:</label>
            {selectedToken.owner !== undefined ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <a
                  href={`https://etherscan.io/address/${selectedToken.owner}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedToken.owner.slice(0, 10)}...
                  {selectedToken.owner.slice(
                    selectedToken.owner.length - 8,
                    selectedToken.owner.length
                  )}
                </a>
                <ClipBoard text={selectedToken.owner} />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="mt-3 d-flex gap-5">
          <div className="d-flex align-items-center justify-content-left gap-2">
            <div>
              B/S:
              {selectedToken.buyCount !== undefined
                ? `${selectedToken.buyCount}/${selectedToken.sellCount}`
                : ""}
            </div>
            <span>
              FB/FS:
              {selectedToken.firstBlockBuyCount}/
              {selectedToken.firstBlockSellCount}
            </span>
            <span>
              Price:
              {price ? price.toFixed(2) : "???"}%
            </span>
           
          </div>
          <div className="d-flex align-items-center justify-content-left">
            <label className="label-content">Swap enabled?:</label>
            <div>{selectedToken.buyCount !== undefined ? "✔" : "❌"}</div>
            <label className="label-content">Locked?:</label>
            <div>
              {isLocked(selectedToken) ? "✔" : "❌"}
              {showUnlockTime(selectedToken)}
            </div>
            <div style={{ marginLeft: "10px" }}>
              LB/LS:
              {isLocked(selectedToken)
                ? `${selectedToken.liquidityLockedBuyCount}/${selectedToken.liquidityLockedSellCount}`
                : ""}
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-left">
            <label className="label-content">Renounced?:</label>
            <div>{isRenounced(selectedToken) ? "✔" : "❌"}</div>
          </div>
          <div className="d-flex align-items-center justify-content-left">
            <label className="label-content">Limit is removed?:</label>
            <div>{isLimitRemoved(selectedToken) ? "✔" : "❌"}</div>
          </div>
          
          <div className="d-flex align-items-center justify-content-right">
            <a
              className="mx-2"
              href={`https://defined.fi/eth/${selectedToken.address}`}
              target="_blank"
              rel="noreferrer"
            >
              Defined
            </a>
            <a
              className="mx-2"
              href={`https://www.dextools.io/app/en/ether/pair-explorer/${getPairAddress(
                selectedToken.address
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              DexTool
            </a>
            <a
              className="mx-2"  
              href={`https://www.dexview.com/eth/${selectedToken.address}`}
              target="_blank"
              rel="noreferrer"
            >
              DexView
            </a>
            <a
              className="mx-2"
              href={`https://honeypot.is/ethereum?address=${selectedToken.address}`}
              target="_blank"
              rel="noreferrer"
            >
              HoneyPot
            </a>
            <label onClick={resetBlockNum} className="label-content launch-label ms-5">Launched on:</label>
            <div className="d-flex align-items-center">
              <div className="arrow-btn mx-1" onClick={() => toBlock(curBlockNum - 1)} >
                <FontAwesomeIcon icon={ faAngleLeft } />
              </div> 
              <a 
                href={`https://etherscan.io/block/${curBlockNum}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="value-content">
                  {curBlockNum}
                </div>
              </a>
              <div className="arrow-btn mx-1" onClick={() => toBlock(curBlockNum + 1)} >
                <FontAwesomeIcon icon={ faAngleRight } />
              </div>
            </div>
          </div>
        </div>
        {/* <div className="mt-3 d-flex gap-5">
          <div className="d-flex align-items-center justify-content-left gap-2">
            <label className="label-content">Site?:</label>
            <div>{selectedToken.isSite === 1 ? "✔" : "❌"}</div>
          </div>
          <div className="d-flex align-items-center justify-content-left gap-2">
            <label className="label-content">TG?:</label>
            <div>{selectedToken.isTG === 1 ? "✔" : "❌"}</div>
          </div>
          <div className="d-flex align-items-center justify-content-left gap-2">
            <label className="label-content">Twitter?:</label>
            <div>{selectedToken.isTwitter === 1 ? "✔" : "❌"}</div>
          </div>
          <div className="d-flex align-items-center justify-content-left gap-2">
            <label className="label-content">Medium?:</label>
            <div>{selectedToken.isMedium === 1 ? "✔" : "❌"}</div>
          </div>
        </div> */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Sniper Txs">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>TxHash</TableCell>
                <TableCell align="middle">From</TableCell>
                <TableCell align="middle">To</TableCell>
                <TableCell align="middle">Nonce</TableCell>
                <TableCell align="middle">TxFee(Eth)</TableCell>
                <TableCell align="middle">Value(Eth)</TableCell>
                <TableCell align="middle">Position</TableCell>
                <TableCell align="middle">Bribe(Eth)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sniperTxs !== undefined ? (
                sniperTxs.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span>{index + 1}</span>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <a
                        href={`https://etherscan.io/tx/${row.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {`${row.txHash.slice(0, 5)}...${row.txHash.slice(
                          row.txHash.length - 3,
                          row.txHash.length
                        )}`}
                      </a>
                    </TableCell>
                    <TableCell align="middle">
                      <a
                        href={`https://etherscan.io/address/${row.from}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {`${row.from.slice(0, 5)}...${row.from.slice(
                          row.from.length - 3,
                          row.from.length
                        )}`}
                      </a>
                    </TableCell>
                    <TableCell align="middle">
                      <a
                        href={`https://etherscan.io/address/${row.to}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {`${row.to.slice(0, 5)}...${row.to.slice(
                          row.to.length - 3,
                          row.to.length
                        )}`}
                      </a>
                    </TableCell>
                    <TableCell align="middle" style={{ color: row.nonce >= NONCE.HIGH || row.nonce <= NONCE.LOW ? 'red' : 'inherit' }}>{row.nonce}</TableCell>
                    <TableCell align="middle">{row.gasFee / 1000000000}</TableCell>
                    <TableCell align="middle">{row.value}</TableCell>
                    <TableCell align="middle">{row.position}</TableCell>
                    <TableCell align="middle">{row.bribe}</TableCell>
                  </TableRow>
                ))
              ) : (
                <></>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Modal
        show={ABIModal}
        className="right-full-pop"
        size="lg"
        onHide={() => setABIModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>ABI Contents</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div>
            <ul>
              {/* {ABI.length > 0 &&
                ABI.map((item, index) => {
                  return (
                    item.type === "function" && (
                      <li key={index}>
                        <div className="d-flex">
                          <div>{item.name + " : "}</div>
                          <select className="value-content">
                            {item.inputs.map((value, id) => {
                              return (
                                <option key={id}>
                                  {value.name + "(" + value.type + ")"}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </li>
                    )
                  );
                })} */}
            </ul>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={contractCodeModal}
        className="right-full-pop"
        size="lg"
        onHide={() => setContractCodeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Contract Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div>
            <textarea
              className="w-100 h-100"
              rows={20}
              value={selectedToken.contractSourceCode}
            ></textarea>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showSimulations}
        className="right-full-pop"
        size="lg"
        onHide={() => setShowSimulations(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Simulation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedSimulation ? (
            <div>
              <div className="mb-3">
                {selectedToken.blockNumber +
                  " , " +
                  selectedToken.address +
                  " , " +
                  selectedToken.name +
                  " , " +
                  selectedToken.symbol}
              </div>
              <div className="simlation-details-container">
                <div>
                  {selectedSimulation.map((item, index) => {
                    return (
                      <div
                        className="func-name"
                        key={index}
                        onClick={() => {
                          setFunc(index);
                        }}
                      >
                        {item.addLiquidity === true &&
                        item.enableMethod === "No"
                          ? "addLiquidity"
                          : item.addLiquidity === true &&
                            item.enableMethod !== "No"
                          ? `addLiquidity ->  ${
                              item.enableMethod.split("(")[0]
                            }`
                          : item.enableMethod.split("(")[0]}
                      </div>
                    );
                  })}
                </div>
                <div className="simulation-content">
                  <div>
                    Method:
                    {selectedSimulation[func]?.enableMethod === "No"
                      ? "addLliquidity"
                      : selectedSimulation[func]?.enableMethod.split("(")[0]}
                  </div>
                  <div>
                    BulkTextResult:
                    {selectedSimulation[func]?.isBulkTestSuccess ? "✔" : "❌"}
                  </div>
                  <div>
                    maxSwapPercent:
                    {selectedSimulation[func]?.maxSwapPercent >= 15
                      ? "Max"
                      : selectedSimulation[func]?.maxSwapPercent + "%"}
                  </div>
                  <div>
                    buyTax:
                    {selectedSimulation[func]?.buyTax}
                  </div>
                  <div>
                    sellTax:
                    {selectedSimulation[func]?.sellTax}
                  </div>
                  <div>
                    transferTax:
                    {selectedSimulation[func]?.transferTax}
                  </div>
                  <div>
                    isTransferDelay:
                    {selectedSimulation[func]?.isTransferDelay === true
                      ? "true"
                      : "false"}
                  </div>
                  <div>
                    feeStructures:
                    {selectedSimulation[func]?.feeStructures?.length > 0 ? (
                      <>
                        {selectedSimulation[func].feeStructures.map(
                          (item, index) => {
                            return (
                              <div key={index}>
                                {genText(
                                  item.feeMethod,
                                  item.feeMethodVariableCount,
                                  item.feeMethodVariablePos,
                                  item.feeMethodLowBound,
                                  item.feeMethodFeeChangeRate
                                )}
                              </div>
                            );
                          }
                        )}
                      </>
                    ) : (
                      "No feeStructures"
                    )}
                  </div>
                  <div>
                    DeadBlock:
                    {selectedSimulation[func]?.deadBlockCount}
                  </div>
                  <div>
                    SwapBackPercentage:
                    {selectedSimulation[func]?.swapBackPercentage}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default TokenPage;