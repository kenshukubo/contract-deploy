import React, { useState, useEffect } from "react";
// import { fileURLToPath } from "url";
import './App.css';
// import web3 from 'web3';

function App() {
  // const [images, setImages] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null)
  const [metaMaskFlag, setMetaMaskFlag] = useState<boolean>(false);
  const [account, setAccount] = useState(null);
	// const [errorMessage, setErrorMessage] = useState(null);

	useEffect(() => {
		var tmpFlag = window.ethereum && window.ethereum.isMetaMask;
		setMetaMaskFlag(tmpFlag);
	},[]);

	const connectWallet = async () => {
		// window.ethereum
		// .request({ method: "eth_requestAccounts" })
		// .then((result) => {
		// 	  setAccount(result[0]);
		// })
		// .catch((error) => {
		//   setErrorMessage(error.message);
		// });

    try {
      const acccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (acccounts.length > 0) {
          setAccount(acccounts[0]);
          console.log(acccounts[0]);
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
		// setImages([...images, ...e.target.files]);
    setFile(files[0])
	};

  const handleOnSubmit = async (e: React.SyntheticEvent): Promise<void> => {
		e.preventDefault();
    if (!file) return 

    connectWallet();
		const formData  = new FormData();
    formData.append("file", file)
		// images.map((image) => {
		// 	data.append("images[]", image);
		// });
		console.log(formData)
	};

  return (
    <div className="App">
      <header className="App-header">
        <h2>Mint Test</h2>
      </header>
      <form className="App-form" onSubmit={(e) => handleOnSubmit(e)}>
        {/* <img
          src={URL.createObjectURL(file)}
          style={{
            width: "24%",
            borderRadius: "20px",
            marginBottom: "40px"
          }}
        /> */}
        <input
          // id={inputId}
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
