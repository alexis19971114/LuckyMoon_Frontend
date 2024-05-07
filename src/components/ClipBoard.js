import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Tooltip } from "@mui/material";

const ClipBoard = ({ text }) => {
  const [copyText, setCopyText] = useState("Copy");
  
  const unsecuredCopyToClipboard = (text) => { 
    const textArea = document.createElement("textarea"); 
    textArea.value=text; 
    document.body.appendChild(textArea); 
    textArea.focus();
    textArea.select(); 
    try{
      document.execCommand('copy')
    } catch(err){
      console.error('Unable to copy to clipboard',err)
    }
    document.body.removeChild(textArea)
  };

  const copyEvent = (e) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      unsecuredCopyToClipboard(text);
    }
    // if (copyStatus) {
    setCopyText("Copied");
    // }
    setTimeout(() => {
      setCopyText("Copy");
    }, 1500);
  };
  if (text) {
    return (
      <Tooltip className="copy-btn" title={copyText} arrow placement="top">
        {copyText === "Copy" ? (
          <ContentCopyIcon
            sx={{
              color: "#1976d2",
              fontSize: 17,
              ml: 0.5,
              cursor: "pointer",
            }}
            onClick={copyEvent}
          />
        ) : (
          <DoneAllIcon
            sx={{ color: "#1976d2", fontSize: 17, ml: 0.5, cursor: "pointer" }}
          />
        )}
      </Tooltip>
    );
  }
};

export default ClipBoard;
