
# NotiFolks Backend

This is the REST API of NotifFolks ,a platform where users can set alerts for their several loans on the folks finance platform.
## Download and Build on local
Clone the repository
```bash
    git clone https://github.com/Jaybee020/Haven-API.git
```

Cd into backend folder
```bash
    cd backend
```

If you have docker installed change the redis url in workers config file
```bash
   export const REDIS_URL= "redis://redis"
```

Run the command below
```bash
   docker-compose up
```

If not change the redis url in workers config file
```bash
   export const REDIS_URL= "127.0.0.1:6379"
```

Install node dependencies
```bash
   npm install
```

To start the express server 

```bash
  npm start
```

Open your local browser and verify the server is running with `http://localhost:8000/`


## API Reference
### Get all loans of specified account address and specified tokenpairindex on folks finance
```http
GET /folks/getloan/:accountAddr/:tokenPairIndes
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountAddr` | `string` | **Required**. address of account we want to get loans of. |
| `tokenPairIndex` | `string` | **Required**. required token pair index to retrieve loans info of |

response.body
```bash
{   status:true,
    message:Object[]
        }
```


### Search for loan alerts by account address
```http
GET /folks/loanAlert/accountAddr/:accountAddr
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountAddr` | `string` | **Required**. account address to get loan alerts of|

response.body
```bash
{   
    status:true,
    loaninfo:LoanInfo[]//an array containing serveral loan informations
}
```

#### Helps user take a loan
```http
POST /folks/newLoanTxn
```
All parameters are to be in req.body.The password is used to authenicate transactions
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `collateralAmount` | `string` | **Required**. collateral amount to be used to take loan|
| `borrowAmount` | `string` | **Required**. borrow amount to take for loan |
| `tokenPairIndex` | `string` | **Required**. required token pair indexto be used for loan |
| `accountAddr` | `string` | **Required**. address of user wallet|

This returns an object that contains the escrow address for the loan and transactions signed by the escrow,escrow initiation transactions to be signed by the user and borrow transactions.Signed escrow initialziation transactions are to be kept in a list(usertx_0,signed_escrow_tx,usertx_1) and sent to the chain before borrow transactions are sent.

response.body
```bash
{   status:true,
    data:Object
    }
```


#### Create a new loan alert transaction
```http
POST /folks/createloanAlertTransaction
```
All parameters are to be in req.body.This also checks if the loan is a valid loan.A transfer of 0.01 algos is made to create a new loan alert.
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `escrowAddr` | `string` | **Required**. Address of escrow account used for loan |
| `tokenPairIndex` | `string` | **Required**. token pair index to loan to be taken |
| `accountAddr` | `string` | **Required**. Address of user for loan |

This returns a transaction to be signed by the client

response.body
```bash
{   status:true,
    message:Transaction[]
```


#### Create a new loan alert with for user
```http
POST /folks/createloanAlert
```
All parameters are to be in req.body.A transaction id is to be shown as a receipt.
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `escrowAddr` | `string` | **Required**. Address of escrow account used for loan |
| `txId` | `string` | **Required**. Transaction Id to be used as a receipt |
| `email` | `string` | **Required**. Email for notification alert to be sent to|
  `reminderHealthRatio` | `string` | **Required**. reminder health ratio to be set|
| `tokenPairIndex` | `string` | **Required**. Token pair index of loan to be taken|
| `accountAddr` | `string` | **Required**. Address of user for loan |

response.body
```bash
{   status:true,
    message:"Successful Creation of loan Alert"
```

#### Get loan info of specified escrowAddress and tokenPair
```http
GET /folks/currentLoanInfo/:escrowAddr/:tokenPairIndex"
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `escrowAddr` | `string` | **Required**. account address of escrow account of loan.|
| `tokenPairIndex` | `string` | **Required**. token pair index to get loans of|

response.body
```bash
{   
    escrowAddress:string,
    userAddress:string,
    borrowed:number,
    collateralBalance:number,
    borrowBalance:number,
    borrowBalanceLiquidationThreshold:number,
    healthFactor:number
}
```


#### Prepares a new repayment of loan txn  of user 
```http
POST /folks/repayLoanTxn
```
All parameters are to be in req.body.
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `escrowAddr` | `string` | **Required**. Address of escrow account used for loan |
| `tokenPairIndex` | `string` | **Required**. token pair index used for loan |
| `repayAmount` | `string` | **Required**. amount to be repayed|
| `acoountAddr` | `string` | **Required**. account Address of the borrower |

This returns a transaction to be signed by the client

response.body
```bash
{   status:true,
    data:Transaction
}
```


## Demo
Working link at https://notifolks.herokuapp.com



