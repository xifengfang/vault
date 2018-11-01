module.exports = {
    getERC20TokenBalance: (tokenAddress:string, walletAddress:string, callback:any) => {
        let minABI = [
          // balanceOf
          {
            "constant":true,
            "inputs":[{"name":"_owner","type":"address"}],
            "name":"balanceOf",
            "outputs":[{"name":"balance","type":"uint256"}],
            "type":"function"
          },
          // decimals
          {
            "constant":true,
            "inputs":[],
            "name":"decimals",
            "outputs":[{"name":"","type":"uint8"}],
            "type":"function"
          }
        ];

        let contract = (window as any).web3.eth.contract(minABI).at(tokenAddress);
        contract.balanceOf(walletAddress, (error:any, balance:any) => {
          contract.decimals((error:any, decimals:any) => {
            balance = balance.div(10**decimals);
            console.log(balance.toString());
            callback(balance);
          });
        });
    },

    getERC20TransferData: (tokenAddress:string, toAddress:string, amount: any) => {
      var erc20minABI = [
        // transfer
        {
          "constant": false,
          "inputs": [
            {
              "name": "_to",
              "type": "address"
            },
            {
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "transfer",
          "outputs": [
            {
              "name": "",
              "type": "bool"
            }
          ],
          "type": "function"
        }
      ];
      const contract =  (window as any).web3.eth.contract(erc20minABI).at(tokenAddress);
      const data = contract.transfer.getData(toAddress, (window as any).web3.toHex(amount));
      return data;
    },
  
    getQueryParameter: (paramName: string) => {
        if(!window.location.search) {
            return "";
        }
        var searchString = window.location.search.substring(1),
            i, val, params = searchString.split("&");
      
        for (i=0;i<params.length;i++) {
          val = params[i].split("=");
          if (val[0].toLowerCase() == paramName.toLowerCase()) {
            return val[1];
          }
        }
        return "";
      },
      decimal_expand: 1000000000000000000,
      web3_provider: 'https://mainnet.infura.io/abdwwsswww'
}