import React, { useState, useEffect } from "react";
import NFT from './abi/NFT.json';
import './App.css';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils'
import axios from 'axios';

function App() {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS as string;
  const privateKey = process.env.REACT_APP_PRIVATE_KEY as string;
  const web3:any = new Web3(`https://polygon-mumbai.infura.io/v3/${process.env.REACT_APP_INFURA_PROVIDER_ID}`)
  const contract:any = new web3.eth.Contract(NFT.abi as AbiItem[], contractAddress as string)

  const [file, setFile] = useState<File | null>(null)
  const [account, setAccount] = useState<string>("");
  const [minting, setMinting] = useState<boolean>(false);
  //-- レスポンス用 --
  const [openseaURL, setURL] = useState<string>("");

  useEffect(()=>{
    connectWallet();
  })

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
      console.log("upload done.")
      return publicId;
    } catch (err: any) {
      console.log(err)
    }
  }

  const handleOnSubmit = async (e: React.SyntheticEvent): Promise<void> => {
		e.preventDefault();
    if (!file) return
    setMinting(true);

    // const imageUploadPreset = process.env.REACT_APP_CLOUDINARY_IMAGE_UPLOAD_PRESET as string;
    const imageUploadPreset:string = "voahej67";
    // const metadataUploadPreset = process.env.REACT_APP_CLOUDINARY_IMAGE_METADATA_PRESET as string;
    const metadataUploadPreset:string = "mjvrwvlb";
    const imageUploadURL:string = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/image/upload`;
    const metaDataUploadURL:string = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/raw/upload`;

    //-- 画像の準備 --
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
    const publicId:string = await uploadCloudinary(requestObj);
    if (!publicId) return

    //-- ミントされた数の合計値取得
    const mintCount = await contract.methods.totalSupply().call();
    //-- OpenSeaのURL --
    const tokenId:number = mintCount;
    const url = `https://testnets.opensea.io/ja/assets/mumbai/${contractAddress}/${tokenId}`
    setURL(url);

    //-- メタデータ作成 --
    const metadata = {
      "name": "test",
      "image": `https://res.cloudinary.com/dvtpktk39/image/upload/v1664850218/nft-images/${publicId}.png`,
      "external_url": `https://res.cloudinary.com/dvtpktk39/raw/upload/v1664852396/metadata/${mintCount}.json`,
      "description": "testDesc"
    }
    const jsonObj = JSON.stringify(metadata);
    const blob = new Blob([jsonObj], {
      type: 'application/json'
    });

    var formData  = new FormData();
    formData.append("file", blob)
    formData.append("upload_preset", metadataUploadPreset)
    formData.append("public_id", mintCount)
    var cloudinaryUploadURL = metaDataUploadURL;
    var requestObj = {
      url: cloudinaryUploadURL,
      method: "POST",
      data: formData
    }
    //-- JSONファイルアップロード --
    uploadCloudinary(requestObj);

    //-- MINT --
    const nonce = await web3!.eth.getTransactionCount(account, "latest");
    const tx = {
      from: account,
      to: contractAddress,
      nonce: nonce,
      gas: 500000,
      data: contract.methods.mint(account).encodeABI(),
    };
    const signedTx = await web3!.eth.accounts.signTransaction(tx, privateKey);
    try {
      const _tx = signedTx.rawTransaction as any;
      web3!.eth.sendSignedTransaction(_tx, function (err: any, hash: any) {
        if (!err) {
          console.log("The hash of your transaction is: ", hash);
          alert("NFT作成成功");
        } else {
          console.log(
            "Something went wrong when submitting your transaction:",
            err
          );
          alert("NFT作成失敗");
        }
      })
    } catch(err: any) {
      console.log("Promise failed:", err);
      alert("NFT作成失敗");
    }
    setMinting(false);
	};

  let mintingMessage;
  if(minting) mintingMessage = <p>Creating now ..</p>

  let openseaLink;
  if(openseaURL) openseaLink = <a href={openseaURL} target="_blank" rel="nofollow">View NFT</a>

  return (
    <div className="App">
      <header className="App-header">
        <h2>Mint Test</h2>
        {mintingMessage}
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
        {openseaLink}
      </form>
    </div>
  );
}

export default App;
