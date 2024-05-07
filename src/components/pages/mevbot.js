import React, { useEffect, useState } from "react";
import { SERVER_URL, SERVER_URL2 } from "../utils";
import axios from "axios";

const MevBot = () => {
  const [mevList, setMevList] = useState([]);

  useEffect(async () => {
    let response = await axios({
      method: "get",
      url: `${SERVER_URL2}/api/v1/contractInfo/mev`,
    });
    console.log(response.data)
    setMevList(response.data)
    //console.log(response.data)
    //setTokenList(response.data);
  }, [])
  
  return (
    <div>
      <h1>Mev Bot</h1>
      {
        mevList?.length > 0 && (
          <div>
            { 
              mevList.map((item, index) => {
                return (
                  <div className="d-flex" key={index}>
                    <p className="mx-2">{index + 1}</p>
                    <p className="mx-2">
                      <a 
                        href={`https://etherscan.io/block/${item.blockNumber}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.blockNumber}
                      </a>
                    </p>
                    <p className="mx-2">
                    <a
                      className="mx-2"
                      href={`https://www.dextools.io/app/en/ether/pair-explorer/${item.pair}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.pair}
                    </a>
                    </p>
                    <p className="mx-2">{item.sniperCount}</p>
                  </div>
                )
              })
            }
          </div>
        )
      }
    </div>
  )
}

export default MevBot;