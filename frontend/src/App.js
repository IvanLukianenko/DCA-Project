import './App.css';
import React, { useEffect, Component, useState } from 'react';
import dcaABI from './ContractAbi';
import Web3 from 'web3';

const dcaAddress = "#TODO:0x0000000000000000000000000000";

class DcaApp {
  init() {
    if (window.ethereum) {
      window.ethereum.enable();
      this.web3 = new Web3(window.ethereum);
      this.userAccount = this.web3.eth.accounts[0];
      this.dcaContract = new this.web3.eth.Contract(dcaABI, dcaAddress);
    } else {
      console.error("No extension for ethereum found");
    }

    let _ = setInterval(function () {
      // Check if account has changed
      if (this.web3.eth.accounts[0] !== this.userAccount) {
        this.userAccount = this.web3.eth.accounts[0];
      }
    }, 100);
  }

  async deposit() {
    const amount = document.getElementById('amount').value;
    const accounts = await this.web3.eth.getAccounts();

    try {
      // Call the deposit function on the smart contract
      await this.dcaContract.methods.deposit().send({ from: accounts[0], value: this.web3.utils.toWei(amount, 'ether') });
      alert('Deposit successful!');
    } catch (error) {
      console.error('Error depositing funds:', error);
      alert('Error depositing funds. Please check the console for details.');
    }
  }

  async setDcaParams() {
    const ethAmount = document.getElementById('ethAmount').value;
    const interval = document.getElementById('interval').value;
    const accounts = await this.web3.eth.getAccounts();

    try {
      // Call the setDCAParameters function on the smart contract
      await this.dcaContract.methods.setDCAParameters(this.web3.utils.toWei(ethAmount, 'ether'), interval).send({ from: accounts[0] });
      alert('DCA parameters set successfully!');
    } catch (error) {
      console.error('Error setting DCA parameters:', error);
      alert('Error setting DCA parameters. Please check the console for details.');
    }
  };

  async executeDca() {
    const accounts = await this.web3.eth.getAccounts();

    try {
      // Call the executeDCA function on the smart contract
      await this.dcaContract.methods.executeDCA().send({ from: accounts[0] });
      alert('DCA executed successfully!');
    } catch (error) {
      console.error('Error executing DCA:', error);
      alert('Error executing DCA. Please check the console for details.');
    }
  };
}

class UI extends Component {
  constructor(props) {
    super(props);
    this.dcaApp = new DcaApp();
    this.dcaApp.init();
  }
  render() {
    return (<div>
      <h1>DCA Smart Contract Interaction</h1>
      <button onClick={this.dcaApp.deposit}>Deposit</button>
      <br />
      <label htmlFor="amount">Amount:</label>
      <input type="text" id="amount" placeholder="Enter amount" />
      <br />
      <button onClick={this.dcaApp.setDcaParams}>Set DCA Parameters</button>
      <br />
      <label htmlFor="ethAmount">ETH Amount:</label>
      <input type="text" id="ethAmount" placeholder="Enter ETH amount" />
      <br />
      <label htmlFor="interval">Interval (seconds):</label>
      <input type="text" id="interval" placeholder="Enter interval" />
      <br />
      <button onClick={this.dcaApp.executeDca}>Execute DCA</button>
    </div>
    );
  }
}


export default UI;
