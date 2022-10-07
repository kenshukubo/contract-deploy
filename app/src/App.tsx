import React, { useState, useEffect } from "react";
// import { fileURLToPath } from "url";
import NFT from './abi/NFT.json';
import './App.css';
import Web3 from 'web3';
import axios from 'axios';
import { AbiItem } from 'web3-utils'

function App() {
  // const [images, setImages] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null)
  const [metaMaskFlag, setMetaMaskFlag] = useState<boolean>(false);
  const [account, setAccount] = useState(null);
	// const [errorMessage, setErrorMessage] = useState(null);
	const [contract, setContract] = useState<any>(null);

  const endpoint = process.env.PROVIDER_URL;
  const contractAddress = process.env.CONTRACT_ADDRESS;

	useEffect(() => {
		var tmpFlag = window.ethereum && window.ethereum.isMetaMask;
		setMetaMaskFlag(tmpFlag);
    connectWallet();
    
    const web3 = new Web3(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROVIDER_ID}`);
    const nftContract = new web3.eth.Contract(NFT.abi as AbiItem[], contractAddress)
    setContract(nftContract);
	},[]);

	const connectWallet = async () => {
    try {
      const acccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (acccounts.length > 0) {
          setAccount(acccounts[0]);
      }
    } catch (err: any) {
      if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // ユーザーが接続を拒否するとここに来ます
          console.log('Please connect to MetaMask.');
      } else {
          console.error(err);
      }
    }
	}

  const handleOnAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
		if (!files) return;
    setFile(files[0])
	};

  const handleOnSubmit = async (e: React.SyntheticEvent): Promise<void> => {
		e.preventDefault();
    if (!file) return

    const cloudinaryUploadPreset = "voahej67"
    const cloudName = "dvtpktk39";
		const formData  = new FormData();
    formData.append("file", file)
    formData.append("upload_preset", cloudinaryUploadPreset)
    const cloudinaryUploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const requestObj = {
      url: cloudinaryUploadURL,
      method: "POST",
      data: formData
    }
    try {
      await axios(requestObj);
    } catch (err: any) {
      console.log(err)
    }

    // const tx = {
    //   from: account,
    //   to: contractAddress,
    //   data: contract.methods.mint(this.uri).encodeABI(),
    // };
    // try {
    //   await window.ethereum.request({
    //     method: "eth_sendTransaction",
    //     params: [tx],
    //   });
    //   alert("NFT作成成功");
    // } catch (error) {
    //   alert("NFT作成失敗");
    // }
	};

  return (
    <div className="App">
      <header className="App-header">
        <h2>Mint Test</h2>
      </header>
      <form className="App-form" onSubmit={(e) => handleOnSubmit(e)}>
        <img
          // src={URL.createObjectURL(file)}
          style={{
            width: "24%",
            borderRadius: "20px",
            marginBottom: "40px"
          }}
        />
        <input
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.gif"
          className='App-input'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleOnAddImage(e)
          }
        />
        <button
            type="submit"
            className="App-btn"
          >
            MINT
        </button>
      </form>
    </div>
  );
}

export default App;
