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
// import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { isLocked, isRenounced, isLimitRemoved, getPairAddress, MAX_NUMBER } from "./utils";
import { printCount } from "./utils";
import { SERVER_URL, SERVER_URL2 } from "./utils";
import { Tooltip } from "antd";
import { Spin, Button } from "antd"
import { convertTimezone } from "./utils";
import { NONCE } from "./utils";
import { STAR_LIMIT } from "./utils";
import { Radio } from 'antd';

const Main = () => {

  const navigate = useNavigate();

  const { contextValue, updateContextValue } = useSocketContext();
  const { socket, tokens, profitable, loading, mode} = contextValue
  const [tokenList, setTokenList] = useState(tokens);
  
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
  const [word, setWord] = useState("");
  const [filterTokenList, setFilterTokenList] = useState([]);

  useEffect(() => {
    updateContextValue({
      ...contextValue,
      loading: false,
    })
  }, [filterTokenList])

  useEffect(() => {
    updateContextValue({
      ...contextValue,
      tokens: tokenList,
    })
  }, [tokenList])

  useEffect(() => {
    socket.on("clientConnected", (arg) => {
      console.log("clientConnected", arg);
      toast("Socket is connected", {
        icon: "👏",
        duration: 5000,
        hideProgressBar: true,
      });
      setTokenList(arg.contracts)
    //  socket.emit("getContracts", {});  
    });

    // socket.on("getContracts", (arg) => {
    //   let a = [...tokenList]
    //   let b = [...arg.contracts]
    //   let c = a.concat(b)
    //   setTokenList(c);
    // });

    socket.on("newContractCreated", (arg) => {
      console.log("newContractCreated", arg);
      toast(`${arg.name}/${arg.symbol} is created`, {
        duration: 5000,
        hideProgressBar: true,
      });
      let temp = [...tokenList];
      let tokenInfo = {
        address: arg.address,
        name: arg.name,
        symbol: arg.symbol,
        buyCount: arg.buyCount,
        sellCount: arg.sellCount,
        liquidityLockedHash: arg.liquidityLockedHash,
        removeLimitsHash: arg.removeLimitsHash,
        setMaxTxAmountHash: arg.setMaxTxAmountHash,
        renounceOwnerShipHash: arg.renounceOwnerShipHash,
        updatedOwner: arg.updatedOwner,
        level: arg.level,
      };
      temp.unshift(tokenInfo);
      setTokenList(temp);
      if (!("Notification" in window)) {
        console.log("Browser does not support desktop notification");
      } else {
        Notification.requestPermission();
      }
      new Notification(`New Contract is created ${arg.name}.`);
    });

    socket.on("simulationCreated", (arg) => {
      console.log("simulationCreated", arg);
      if (arg.length > 0) {
        for (let i = 0; i < tokenList.length; ++i) {
          if (tokenList[i].address === arg[0].address) {
            toast(
              `${tokenList[i].name}/${tokenList[i].symbol} simulation is created`,
              {
                duration: 5000,
                hideProgressBar: true,
              }
            );
          }
        }

        if (arg[0].address === selectedToken.address) {
          setSelectedSimulation(arg);
        }
      }
    });

    socket.on("contractVerified", (arg) => {
      console.log("contractVerified", arg);
      // toast(`${arg.address} is verified`, {
      //   autoClose: 5000,
      //   hideProgressBar: true,
      // });
      // let temp = { ...tokenList };
      // for (var i = 0; i < temp["contracts"].length; i++) {
      //   if (temp["contracts"][i].address === arg.address) {
      //     temp["contracts"][i].isVerified = true;
      //     temp["contracts"][i].contractABI = arg.contractABI;
      //     temp["contracts"][i].contractSourceCode = arg.sourceCode;
      //   }
      // }
      // setTokenList(temp);
    });

    socket.on("swapEnabled", (arg) => {
      let tempTokenList = [...tokenList];
      for (let i = 0; i < tokenList.length; ++i) {
        if (tokenList[i].address === arg.address) {
          tempTokenList[i].buyCount = arg.buyCount;
          tempTokenList[i].sellCount = arg.sellCount;
          tempTokenList[i].firstBlockBuyCount = arg.firstBlockBuyCount;
          tempTokenList[i].firstBlockSellCount = arg.firstBlockSellCount;
        }
      }
      setTokenList(tempTokenList);
      if (selectedToken.address === arg.address) {
        toast(`${arg.name}/${arg.symbol} is swap enabled.`, {
          duration: 5000,
          hideProgressBar: true,
        });
        setSelectedToken(arg);
      }
    });

    socket.on("swapped", (arg) => {
      if (selectedToken.address === arg.address) {
        arg.sniperTxs = selectedToken.sniperTxs;
        setSelectedToken(arg);
      }
      let tempTokenList = [...tokenList];
      for (let i = 0; i < tokenList.length; ++i) {
        if (tokenList[i].address === arg.address) {
          tempTokenList[i].buyCount = arg.buyCount;
          tempTokenList[i].sellCount = arg.sellCount;
        }
      }
      setTokenList(tempTokenList);
    });

    socket.on("lpLocked", (arg) => {
      if (selectedToken.address === arg.address) setSelectedToken(arg);
      let tempTokenList = [...tokenList];
      for (let i = 0; i < tokenList.length; ++i) {
        if (tokenList[i].address === arg.address) {
          console.log(arg);
          tempTokenList[i].liquidityLockedHash = arg.liquidityLockedHash;
          tempTokenList[i].liquidityUnlockTime = arg.liquidityUnlockTime;
          toast(
            `${arg.name}/${arg.symbol} lp is locked.\n\n ${
              isLocked(arg) ? "✔" : "❌"
            }LOCK ${isRenounced(arg) ? "✔" : "❌"}Reno ${
              isLimitRemoved(arg) ? "✔" : "❌"
            }ReLi`,
            {
              duration: 5000,
              hideProgressBar: true,
            }
          );
        }
      }
      setTokenList(tempTokenList);
    });

    socket.on("tokenLocked", (arg) => {
      console.log("tokenLocked", arg);
      toast(
        `${arg.name}/${arg.symbol} token is locked.\n\n ${
          isLocked(arg) ? "✔" : "❌"
        }LOCK ${isRenounced(arg) ? "✔" : "❌"}Reno ${
          isLimitRemoved(arg) ? "✔" : "❌"
        }ReLi`,
        {
          duration: 5000,
          hideProgressBar: true,
        }
      );
      if (selectedToken.address === arg.address) setSelectedToken(arg);
    });

    socket.on("limitRemoved", (arg) => {
      console.log("limitRemoved", arg);
      if (selectedToken.address === arg.address) setSelectedToken(arg);
      let tempTokenList = [...tokenList];
      for (let i = 0; i < tokenList.length; ++i) {
        if (tokenList[i].address === arg.address) {
          console.log(arg);
          toast(
            `${arg.name}/${arg.symbol} limit removed.\n\n ${
              isLocked(arg) ? "✔" : "❌"
            }LOCK ${isRenounced(arg) ? "✔" : "❌"}Reno ${
              isLimitRemoved(arg) ? "✔" : "❌"
            }ReLi`,
            {
              duration: 5000,
              hideProgressBar: true,
            }
          );
          tempTokenList[i].removeLimitsHash = arg.removeLimitsHash;
          tempTokenList[i].setMaxTxAmountHash = arg.setMaxTxAmountHash;
        }
      }
      setTokenList(tempTokenList);
    });

    socket.on("renounced", (arg) => {
      if (selectedToken.address === arg.address) setSelectedToken(arg);
      let tempTokenList = [...tokenList];
      for (let i = 0; i < tempTokenList.length; ++i) {
        if (tempTokenList[i].address === arg.address) {
          toast(
            `${arg.name}/${arg.symbol} renounced.\n\n ${
              isLocked(arg) ? "✔" : "❌"
            }LOCK ${isRenounced(arg) ? "✔" : "❌"}Reno ${
              isLimitRemoved(arg) ? "✔" : "❌"
            }ReLi`,
            {
              duration: 5000,
              hideProgressBar: true,
            }
          );
          tempTokenList[i].renounceOwnerShipHash = arg.renounceOwnerShipHash;
          tempTokenList[i].updatedOwner = arg.updatedOwner;
        }
      }
      setTokenList(tempTokenList);
    });

    return () => {
      socket.off("clientConnected");
      socket.off("simulationCreated");
      socket.off("newContractCreated");
      socket.off("contractVerified");
      socket.off("swapEnabled");
      socket.off("swapped");
      socket.off("lpLocked");
      socket.off("tokenLocked");
      socket.off("limitRemoved");
      socket.off("renounced");
    };
  }, [tokenList, socket, selectedToken, selectedSimulation]);
  // });

  // const [ABI, setABI] = useState(
  //   tokenList["contracts"][selectedToken] &&
  //     selectedToken.contractABI !== "Contract source code not verified"
  //     ? JSON.parse(tokenList["contracts"][selectedToken].contractABI)
  //     : []
  // );

  const selectToken = async (e, item) => {
    if(isThisBtn(e.target.classList)) return;
    // updateContextValue({
    //   ...contextValue,
    //   loading: true,
    // })
    if(e.ctrlKey) {
      window.open(`/${item.address}`, `/${item.address}`);
    } else {
      navigate(`/${item.address}`);
    }
    setFunc(0);
  };

  const isThisBtn = (list) => {
    for(const item of list) {
      if (item == "copy-btn") return true;
      if (item == "url-tag") return true;
    }
    return false;
  }

  const copyBtnClicked = (e, value) => {
    navigator.clipboard.writeText(value)
  }
  // const handleToast = () => {
  // 	toast("Socket is connected", {
  // 		autoClose: 1500,
  // 		hideProgressBar: true,
  // 	});
  // };

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

  const searchWord = (e) => {
    setWord(e.target.value);
  }

  const updateProfitable =  (e, status) => {
    switch(status) {
      case "active":
      case "lock":
      case "owner":
      case "reow":
      case "reli":
      case "star":
        updateContextValue({
          ...contextValue,
          profitable:{
            ...contextValue.profitable,
            [status]: !contextValue.profitable[status]
          }
        })
      break;

      case "bgMaxRate":
      case "masMaxRate":
      case "mevSpecialRate":
        let val = e.target.value ? parseFloat(e.target.value) : 0
        if(val >= 1) val = 1;
        if(val <= 0) val = 0;
        updateContextValue({
          ...contextValue,
          profitable:{
            ...contextValue.profitable,
            [status]:  val
          }
        })
      break;

      case "price":
      case "ratio":
        updateContextValue({
          ...contextValue,
          profitable:{
            ...contextValue.profitable,
            [status]:  e.target.value ? parseFloat(e.target.value) : MAX_NUMBER
          }
        })
      break;

      case "snipedMax":
        updateContextValue({
          ...contextValue,
          profitable:{
            ...contextValue.profitable,
            [status]:  e.target.value ? parseInt(e.target.value) : MAX_NUMBER
          }
        })
      break;

      default:
        updateContextValue({
          ...contextValue,
          profitable:{
            ...contextValue.profitable,
            [status]:  e.target.value ? parseInt(e.target.value) : 0
          }
        })
      break;
    }
  }

  useEffect(() => {
    tokenFilter(word, profitable)
  }, [word, profitable])

  useEffect(() => {
    tokenFilter(word, profitable)
  }, [tokenList])

  const isOwnerBuy = (item) => {
    const nonce0  = item.snipeData.nonceSmallCount
    const nonce   = item.snipeData.sniperTxCount
    const snipers = item.snipeData.snipers

    if(Math.abs(nonce - nonce0) >= NONCE.DEVI) return false;
    return true;
  }

  const isStar = (item) => {
    // if (item.snipeData.snipers >= STAR_LIMIT.SNIPERS) return true;
    if (item.hasOwnProperty("special") && item.special) return true;
    // if (item.hasOwnProperty("nonceToPriceRatio") && item.nonceToPriceRatio < 15) return true;
    return false;
  }

  const tokenFilter = (word, profitable) => {
    try {
      setFilterTokenList(tokenList.filter((item, index) => {
        if (profitable?.active) {
          if (!item.hasOwnProperty("buyCount")) return false;
          if (!item.hasOwnProperty("sellCount")) return false;
          if (!item.hasOwnProperty("snipeData")) return false;
          if (!item.hasOwnProperty("nonceToPriceRatio")) return false;
          
          if (item.snipeData.nonceSmallCount < profitable.nonce) return false;
          if (item.snipeData.snipers < profitable.snipers) return false;
          if (item.snipeData.sniperTxCount < profitable.snipedMin) return false;
          if (item.snipeData.sniperTxCount > profitable.snipedMax) return false;
          if (item.buyCount < profitable.buyCount) return false;
          if (item.sellCount < profitable.sellCount) return false;
          if (item.buyCount + item.sellCount < profitable.swapCount) return false;
          if (item.price >= profitable.price) return false;
          if (item.nonceToPriceRatio >= profitable.ratio) return false;
          if (profitable.owner && !isOwnerBuy(item)) return false;
          if (profitable.lock && !isLocked(item)) return false;
          if (profitable.reow && !isRenounced(item)) return false;
          if (profitable.reli && !isLimitRemoved(item)) return false;
          if (profitable.star && !isStar(item)) return false;
        }
        if (!item.hasOwnProperty("name")) return false; 
        if (!item.hasOwnProperty("symbol")) return false;
        if (!item.hasOwnProperty("address")) return false;
        if (!item.hasOwnProperty("pair")) return false;
        // if (!item.hasOwnProperty("blockNumber")) return false;

        if(
          !item.name.toLowerCase().includes(word.toLowerCase()) && 
          !item.symbol.toLowerCase().includes(word.toLowerCase()) &&
          !item.address.toLowerCase().includes(word.toLowerCase()) &&
          !item.pair.toLowerCase().includes(word.toLowerCase())
          // !item.blockNumber.toLowerCase().includes(word.toLowerCase())
        ) 
          return false;
        return true;
      }))
    } catch (e) {
      console.log(e)
      console.log("here", tokenList)
    }
  }

  const fetchContracts = async () => {
    if(profitable.nonce <= 0) profitable.nonce = 0;
    if(profitable.snipers <= 0) profitable.snipers = 0;
    if(profitable.bgMinCount <= 0) profitable.bgMinCount = 0;

    updateContextValue({
      ...contextValue,
      loading: true,
    })

    const response = await axios({
      method: "get",
    //  url: `${SERVER_URL}/api/v1/contractInfo/filter?nonce0s=${profitable.nonce}&snipers=${profitable.snipers}`,
      url: `${SERVER_URL}/api/v1/contractInfo/filter`,
      params: {
        nonce0s: profitable.nonce,
        snipers: profitable.snipers,
        BG_MinCount: profitable.bgMinCount,
        BG_Rate: profitable.bgMaxRate,
        MAS_Rate: profitable.masMaxRate,
        MEV_Rate: profitable.mevSpecialRate
      }
    });
    console.log("Fetch Success")
    setTokenList(response.data);
  } 

  const setMode = async (e) => {
    let mode = e.target.value
    let response;
    console.log(mode)

    updateContextValue({
      ...contextValue,
      mode: mode,
      loading: true,
    })

    switch(mode) {
      case "all":
        try {
          const response = await axios({
            method: "get",
            url: `${SERVER_URL}/api/v1/contractInfo/filter`,
            params: {
              nonce0s: profitable.nonce,
              snipers: profitable.snipers,
            }
          });
          console.log("All Fetch Success")
          setTokenList(response.data);
        } catch (e) {
          alert("This api is not supported now.")
        }
      break;

      case "nonce":
        try {
          const response = await axios({
            method: "get",
            url: `${SERVER_URL}/api/v1/contractInfo/filterNonce`,
          });
          console.log("Nonce Fetch Success")
          console.log(response.data)
          setTokenList(response.data);
        } catch (e) {
          alert("Nonce Fetch api is not supported now.")
        }

      break;

      case "wallet":
        try {
          const response = await axios({
            method: "get",
            url: `${SERVER_URL}/api/v1/contractInfo/filterWallet`,
          });
          console.log("Wallet Fetch Success")
          setTokenList(response.data);       
        } catch (e) {
          alert("Wallet Fetch api is not supported now.")
        }
        
      break;
    }
  }

  const sortTokensByRatio = () => {
    let a  = [...tokenList]
    let b = a.sort((a, b) => {
      var a_s = a.snipeData?.snipers? a.snipeData.snipers : 0
      var b_s = b.snipeData?.snipers? b.snipeData.snipers : 0
      
      if(!a.hasOwnProperty("nonceToPriceRatio") || a_s == 0) return 1;
      if(!b.hasOwnProperty("nonceToPriceRatio") || b_s == 0) return -1;
      
      // var a_p = a.price ? parseFloat(a.price) + 100 : 0
      // var b_p = b.price ? parseFloat(b.price) + 100: 0
      // var a_r = a_p / a_s;
      // var b_r = b_p / b_s;
      
      // if (a_r > b_r) return 1;
      // if (a_r < b_r) return -1;
   
      if (a.nonceToPriceRatio > b.nonceToPriceRatio) return 1;
      if (a.nonceToPriceRatio < b.nonceToPriceRatio) return -1;
      return 0;
    })
    let c = [...b]
    setTokenList(c)
    // setFilterTokenList(
    //   [...filterTokenList.sort((a, b) => {
    //     if (a.nonceToPriceRatio > b.nonceToPriceRatio) return 1;
    //     if (a.nonceToPriceRatio < b.nonceToPriceRatio) return -1;
    //     return 0;
    //   })]
    // )
  }

  const sortTokensByCreatedAt = () => {
    let a  = [...tokenList]
    let b = a.sort((a, b) => {
      if(!a.hasOwnProperty("createdAt")) return -1;
      if(!b.hasOwnProperty("createdAt")) return 1;
      
      if (a.createdAt > b.createdAt) return -1;
      if (a.createdAt < b.createdAt) return 1;
   
      return 0;
    })
    let c = [...b]
    setTokenList(c)
  }

  return (
    <div className="main-container">
      {
        loading && (
          <div className="loading">
            <Spin size="large" />
          </div>
        )
      }   
      <div className="d-flex justify-content-center">
        <div className="search mt-3">
          <div className="d-flex align-items-center">
            <BsSearch className="ms-4" />
            <input type="text" className="search-input" onChange={(e) => searchWord(e)} value={word}/>
            <FormControlLabel
              className="ms-5"
              checked={profitable.active}
              control={<Checkbox />}
              label="Filter"
              labelPlacement="start"
              onChange={(e) => updateProfitable(e, "active")}
            />
            <span className="mx-4"><b>Searched: </b>{filterTokenList.length}</span>
            <Radio.Group onChange={setMode} value={mode}>
              <Radio value={"all"}>All</Radio>
              {/* <Radio value={"nonce"}>Owner-Buy</Radio> */}
              <Radio value={"wallet"}>Wallet</Radio>
            </Radio.Group>
            {/* <a className="ms-5" href="/mevbot" target="_blank" rel="noreferrer">MevBot</a> */}
            <Button ghost type="primary" className="ms-2" onClick={sortTokensByRatio}>Sort By Ratio</Button>
            <Button ghost type="primary" className="ms-2" onClick={sortTokensByCreatedAt}>Sort By Created At</Button>
          </div>

          {
            profitable?.active && (
              <div>
                <div className="ms-4 d-flex align-items-center mb-2">
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Buy:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "buyCount")} 
                      value={profitable.buyCount == 0 ? "" : profitable.buyCount}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Sell:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "sellCount")} 
                      value={profitable.sellCount == 0 ? "" : profitable.sellCount}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Swap:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "swapCount")} 
                      value={profitable.swapCount == 0 ? "" : profitable.swapCount}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Price:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "price")} 
                      value={profitable.price == MAX_NUMBER ? "" : profitable.price}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Ratio:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "ratio")} 
                      value={profitable.ratio == MAX_NUMBER ? "" : profitable.ratio}
                    />
                  </div>
                  {/* <FormControlLabel
                    checked={profitable.owner}
                    control={<Checkbox />}
                    label="Owner"
                    labelPlacement="start"
                    onChange={(e) => updateProfitable(e, "owner")}
                  /> */}
                  <FormControlLabel
                    checked={profitable.lock}
                    control={<Checkbox />}
                    label="Lock"
                    labelPlacement="start"
                    onChange={(e) => updateProfitable(e, "lock")}
                  />
                  <FormControlLabel
                    checked={profitable.reow}
                    control={<Checkbox />}
                    label="REOW"
                    labelPlacement="start"
                    onChange={(e) => updateProfitable(e, "reow")}
                  />
                  <FormControlLabel
                    checked={profitable.reli}
                    control={<Checkbox />}
                    label="RELI"
                    labelPlacement="start"
                    onChange={(e) => updateProfitable(e, "reli")}
                  />
                  <FormControlLabel
                    checked={profitable.star}
                    control={<Checkbox />}
                    label="Star"
                    labelPlacement="start"
                    onChange={(e) => updateProfitable(e, "star")}
                  />
                </div>
                <div className="ms-4 d-flex align-items-center mb-2">
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Sniped-Min:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "snipedMin")} 
                      value={profitable.snipedMin == 0 ? "" : profitable.snipedMin}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Sniped-Max:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "snipedMax")} 
                      value={profitable.snipedMax == MAX_NUMBER ? "" : profitable.snipedMax}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Nonce{"~0:"}</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "nonce")} 
                      value={profitable.nonce == 0 ? "" : profitable.nonce}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">Snipers:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "snipers")} 
                      value={profitable.snipers == 0 ? "" : profitable.snipers}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">BG_MinCount:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "bgMinCount")} 
                      value={profitable.bgMinCount == 0 ? "" : profitable.bgMinCount}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">BG_Rate:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "bgMaxRate")} 
                      value={profitable.bgMaxRate == 0 ? "" : profitable.bgMaxRate}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">MAS_Rate:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "masMaxRate")} 
                      value={profitable.masMaxRate == 0 ? "" : profitable.masMaxRate}
                    />
                  </div>
                  <div className="profitable-bar mx-2 d-flex">
                    <span className="mx-2">MEV_Rate:</span>
                    <input type="number" 
                      onChange={(e) => updateProfitable(e, "mevSpecialRate")} 
                      value={profitable.mevSpecialRate == 0 ? "" : profitable.mevSpecialRate}
                    />
                  </div>
                  <Button size="large" ghost type="primary" className="ms-5 px-5 filter-btn" onClick={fetchContracts}>Fetch</Button>
                
                </div>
                
              </div>
            )
          }
        </div>
      </div>

      
      {/* <div className="mt-3">
        <div className="d-flex align-items-center">
          <div className="d-flex gap-3">
            <button
              type="button"
              className={`btn btn-outline-secondary btn-sm w-10 ${
                selectedSimulation.length === 0 ? "disabled" : ""
              }`}
              onClick={() => setShowSimulations(true)}
              style={
                selectedSimulation.length === 0
                  ? { backgroundColor: "#000000" }
                  : {}
              }
            >
              Simulation results
            </button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => removeToken()}
            >
              🚮
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => starToken()}
            >
              ⭐⭐⭐
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => recoverToken()}
            >
              ♻♻♻
            </Button>
            <FormControlLabel
              checked={showNormalTokens}
              control={<Checkbox />}
              label="Normal"
              labelPlacement="start"
              onChange={(e) => {
                setShowNormalTokens(!showNormalTokens);
              }}
            />
            <FormControlLabel
              checked={showRemovedTokens}
              control={<Checkbox />}
              label="Removed"
              labelPlacement="start"
              onChange={(e) => {
                setShowRemovedTokens(!showRemovedTokens);
              }}
            />
            <FormControlLabel
              checked={showStaredTokens}
              control={<Checkbox />}
              label="Stared"
              labelPlacement="start"
              onChange={(e) => {
                setShowStaredTokens(!showStaredTokens);
              }}
            />
            <FormControlLabel
              checked={showSwappedTokens}
              control={<Checkbox />}
              label="Swaped"
              labelPlacement="start"
              onChange={(e) => {
                setShowSwappedTokens(!showSwappedTokens);
              }}
            />
            <FormControlLabel
              checked={showLockedTokens}
              control={<Checkbox />}
              label="Locked"
              labelPlacement="start"
              onChange={(e) => {
                setShowLockedTokens(!showLockedTokens);
              }}
            />
            <FormControlLabel
              checked={showRenouncedTokens}
              control={<Checkbox />}
              label="Renounced"
              labelPlacement="start"
              onChange={(e) => {
                setShowRenouncedTokens(!showRenouncedTokens);
              }}
            />
            <FormControlLabel
              checked={showLimitRemovedTokens}
              control={<Checkbox />}
              label="Remove Limite"
              labelPlacement="start"
              onChange={(e) => {
                setShowLimitRemovedTokens(!showLimitRemovedTokens);
              }}
            />
          </div>
        </div>
      </div> */}

      <Toaster position="top-right" />
      <div className="left-sidebar">
        {/* <div className="logo">Logo</div> */}
        <div className="token-list">
          {filterTokenList.map((item, index) => {
            if (
              item.symbol !== "USDT" &&
              item.symbol !== "DAI" &&
              item.symbol !== "ETH" &&
              item.symbol !== "USDC" &&
              item.symbol !== "BUSD" &&
              item.symbol !== "ETH" &&
              item.symbol !== "ERC20-DAI"
              // && item.buyCount + item.sellCount >= 200
              // && item.firstBlockBuyCount != undefined && item.snipeData.Banana + item.snipeData.Maestro >= 50
              // && item.snipeData.Banana + item.snipeData.Maestro < 25
              // && item.snipeData.Maestro >= 5
              // && item.firstBlockBuyCount != undefined && item.firstBlockBuyCount >= 30
              // && item.firstBlockBuyCount != undefined && item.firstBlockBuyCount < 10
              // && item.firstBlockBuyCount >= 5
              // && item.snipeData.Maestro > item.snipeData.Banana
              // && item.snipeData.Banana != 0
            ) {
              if (
                ((item.level === 0 && showNormalTokens) ||
                  (item.level === 1 && showRemovedTokens) ||
                  (item.level === 2 && showStaredTokens)) &&
                ((item.buyCount !== undefined && showSwappedTokens) ||
                  !showSwappedTokens) &&
                ((isLocked(item) && showLockedTokens) || !showLockedTokens) &&
                ((isRenounced(item) && showRenouncedTokens) ||
                  !showRenouncedTokens) &&
                ((isLimitRemoved(item) && showLimitRemovedTokens) ||
                  !showLimitRemovedTokens)
              )
                return (
                  <div
                    key={index}
                    className="token-item"
                    onClick={(e) => selectToken(e, item)}
                    style={
                      item.address === selectedToken.address
                        ? { backgroundColor: "#777777" }
                        : {}
                    }
                  >
                    <div className="row">
                      <span className="col-2 px-3">
                        <b>{item.symbol.length > 10
                          ? `${item.symbol.slice(0, 10)}...(${item.symbol.length})`
                          : item.symbol}{" "}</b>
                        {" , "}
                        <b>{item.name.length > 10
                          ? `${item.name.slice(0, 10)}...(${item.name.length})`
                          : item.name}{" "}</b>
                        {item.level === 2 ? "⭐⭐⭐" : ""}
                      </span>
                      <span className="col-3 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <b>Contract: </b>
                            <a
                              className="url-tag"
                              href={`https://etherscan.io/address/${item.address}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.address.slice(0, 38)}...                          
                            </a>
                          </div>
                          <div className="me-3">
                            <ClipBoard text={item.address} />
                          </div>
                        </div>
                      </span>
                      <span className="col-3 px-3">
                        <b>Created:</b> {item.createdAt ? convertTimezone(item.createdAt) : "???"}
                      </span>
                      <span className="col-1 px-3">
                        <b>Block:</b> {item.blockNumber ? item.blockNumber : 0}
                      </span>
                      <span className="col-1 px-3">
                        <b>Buy/Sell:</b> {`${item.buyCount ? item.buyCount : 0}/${item.sellCount ? item.sellCount : 0}`}
                      </span>
                      <span className="col-1 px-3">
                        <b>Price:</b> {item.price ? item.price.toFixed(2) : 0}
                      </span>
                      <span className="col-1 px-3">
                        <b>Ratio:</b> 
                        {item.nonceToPriceRatio ? item.nonceToPriceRatio.toFixed(2) : MAX_NUMBER}/
                        {item.price && item.snipeData?.snipers ? ((parseFloat(item.price) + 100.0)/parseFloat(item.snipeData.snipers)).toFixed(2) : MAX_NUMBER}
                      </span>
                      <span className="col-2 px-3">
                        <b>Sniped:</b> {item.snipeData?.sniperTxCount? item.snipeData.sniperTxCount : 0 }{"("}
                        <b>S:</b> {item.snipeData?.nonceSmallCount? item.snipeData.nonceSmallCount : 0 }{"  "}
                        <b>H:</b> {item.snipeData?.nonceHighCount? item.snipeData.nonceHighCount : 0 }{")"}
                      </span>
                  
                      <span className="col-3 px-3">
                        { item.pair && (
                          <div className="d-flex justify-content-between align-items-center">
                            <div><b>Pair: </b>
                              <a
                                className="url-tag"
                                href={`https://www.dextools.io/app/en/ether/pair-explorer/${item.pair}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.pair.slice(0, 38)}...
                              </a>
                            </div>
                            <div className="me-3">
                              <ClipBoard text={item.pair} />
                            </div>
                          </div>
                        )}
                      </span>
                      <div className="col-3 px-3">
                        Swap: {item.buyCount !== undefined ? "✔ " : "❌ "}
                        Lock: {isLocked(item) ? "✔ " : "❌ "}
                        Renounce Ownership: {isRenounced(item) ? "✔ " : "❌ "}
                        Remove Limits: {isLimitRemoved(item) ? "✔ " : "❌ "}
                      </div>
                      <span className="col-1 px-3">
                        <b>Snipers:</b> {item.snipeData?.snipers? item.snipeData.snipers : 0 }
                      </span>
                      <span className="col-1 px-3">
                        <b>BG/MAS:</b> {item.snipeData?.BGCount? item.snipeData.BGCount : 0 }/{item.snipeData?.MastroCount? item.snipeData.MastroCount : 0 }
                      </span>
                      
                      <span className="col-2 px-3">
                        <b>Unlock:</b> {showUnlockTime(item)}
                      </span>
                      
                    </div>
                    
                  </div>
                );
            }
            return <div key={index}></div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default Main;
