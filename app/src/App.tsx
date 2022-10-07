import React, { useState, useEffect } from "react";
import NFT from './abi/NFT.json';
import './App.css';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import axios from 'axios';

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [metaMaskFlag, setMetaMaskFlag] = useState<boolean>(false);
  const [account, setAccount] = useState(null);
	const [contract, setContract] = useState<any>(null);

  const endpoint = process.env.PROVIDER_URL;
  const contractAddress = process.env.CONTRACT_ADDRESS;

	useEffect(() => {
		var tmpFlag = window.ethereum && window.ethereum.isMetaMask;
		setMetaMaskFlag(tmpFlag);
    //-- メタマスク接続 --
    connectWallet();
    //-- コントラクトに接続 --
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
          //-- ユーザーが接続を拒否すると --
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

  const uploadCloudinary = async (obj: any) => {
    try {
      const res = await axios(obj);
      const publicId = res.data.public_id.substr(res.data.public_id.indexOf('/') + 1);
      return publicId;
    } catch (err: any) {
      console.log(err)
    }
  }

  const handleOnSubmit = async (e: React.SyntheticEvent): Promise<void> => {
		e.preventDefault();
    if (!file) return

    const cloudName = "dvtpktk39";
    const imageUploadPreset:any = "voahej67"
    const metadataUploadPreset:any = "mjvrwvlb"
    const imageUploadURL:string = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const metaDataUploadURL:string = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

    var formData = new FormData();
    formData.append("file", file)
    formData.append("upload_preset", imageUploadPreset)
    var cloudinaryUploadURL = imageUploadURL;
    var requestObj = {
      url: cloudinaryUploadURL,
      method: "POST",
      data: formData
    }
    
    //-- 画像のアップロード --
    const publicId = await uploadCloudinary(requestObj);

    // -- ミントされた数を取得 --
    const mintCount = contract.methods.totalSupply()._method.outputs.length;
    //-- メタデータ作成 --
    const metadata = {
      "name": "test",
      "image": `https://res.cloudinary.com/dvtpktk39/image/upload/v1664850218/nft-images/${publicId}.png`,
      "external_url": `https://res.cloudinary.com/dvtpktk39/raw/upload/v1664852396/metadata/${mintCount}.json`,
      "description": "testDesc"
    }
    // const metadata = {
    //   "name": "test",
    //   "image": `https://res.cloudinary.com/dvtpktk39/image/upload/v1664850218/nft-images/0.png`,
    //   "external_url": `https://res.cloudinary.com/dvtpktk39/raw/upload/v1664852396/metadata/1.json`,
    //   "description": "testDesc"
    // }
    const jsonObj = JSON.stringify(metadata);

    var formData  = new FormData();
    formData.append("file", jsonObj)
    formData.append("upload_preset", metadataUploadPreset)
    var cloudinaryUploadURL = metaDataUploadURL;
    var requestObj = {
      url: cloudinaryUploadURL,
      method: "POST",
      data: formData
    }
    // -- JSONファイルアップロード --
    uploadCloudinary(requestObj);

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
          // accept="image/*,.png,.jpg,.jpeg,.gif"
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
