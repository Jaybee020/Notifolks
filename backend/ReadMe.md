
# NotiFolks

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

#### Create a new user 

```http
POST /register
```
All parameters are to be in req.body.The password is used to encrypt your secret key and the password is then required to sign future transactions
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountAddr` | `string` | **Required**. Account address of new user |
| `email` | `string` | **Required**. Email of new user |
| `password` | `string` | **Required**. Password of new user |
| `mnemonic` | `string` | **Required**. Mnemonic phrase of account of new user |

response.body
```bash
    {message:"Your account was succesfully created"}
```

#### Log in existing user
```http
POST /login
```
All parameters are to be in req.body
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountAddr` | `string` | **Required**. Account address of existing user |
| `password` | `string` | **Required**. Password of existing user |

response.body
```bash
{message:"Successful Login",token:token}
```
#### get authenticated user details
```http
GET /user/auth
```
response.body
```bash
   userData: {username: req.user?.accountAddr,
   email: req.user?.email,}
```

#### Logout existing user
```http
POST /logout
```
response.body
```bash
   { message: "Logging out user" }
```

### Get all loans of specified account address on folks finance
```http
GET /folks/getLoan/:accountAddr
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `accountAddr` | `string` | **Required**. address of account we want to get loans of. |

response.body
```bash
{   status:true,
    message:Object[]
        }
```


### Search for loan alerts by userId
```http
GET folks/loanAlert/userId/:userId
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `userId` | `string` | **Required**. userId to get loan alerts of|

response.body
```bash
{   
    executed:boolean,
    user:ObjectId,
    escrowAddr:string,
    reminderHealthRatio:string,
    tokenPairKeys:string
}
```


### Search for loan alerts by tokenpairindex
```http
GET folks/loanAlert/tokenPairIndex/:tokenPairIndex"
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `tokenPairIndex` | `string` | **Required**. token pair index to get loans of|

response.body
```bash
{   
    executed:boolean,
    user:ObjectId,
    escrowAddr:string,
    reminderHealthRatio:string,
    tokenPairKeys:string
}
```


### Delete an alert from logged in user alerts
```http
DELETE /folks/alert/:escrow
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user to delete from friends|

response.body
```bash
{message:"Successfully removed"+username+"from your friends"}
```


#### Helps loggged in user take a loan
```http
POST /folks/createloan
```
All parameters are to be in req.body.The password is used to authenicate transactions
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `collateralAmount` | `string` | **Required**. collateral amount to be used to take loan|
| `borrowAmount` | `string` | **Required**. borrow amount to take for loan |
| `tokenPairIndex` | `string` | **Required**. required token pair index to be used for loan |
| `password` | `string` | **Required**. password of logged in user|
response.body
```bash
{   status:true,
    escrowAddr:string
    }
```

,,,

#### Create a new Loan alert with loggged in user
```http
POST /folks/createloanAlert
```
All parameters are to be in req.body.A transfer of 0.01 algos is made to create a new loan alert.The password is used to authenicate transactions
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `escrowAddr` | `string` | **Required**. Address of escrow account used for loan |
| `tokenPairKeyIndex` | `string` | **Required**. Address of escrow account used for loan |
| `reminderHealthRatio` | `string` | **Required**. Address of escrow account used for loan |
| `password` | `string` | **Required**. Address of escrow account used for loan |
response.body
```bash
{   status:true,
    message:"Successful Creation of Alert"}
```

#### Get loan info of specified escrowAddress and tokenPair
```http
GET /folks/currentLoanInfo/:escrowAddr/:tokenPairKeyIndex"
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


escrowAddr,repayAmount,tokenPairKeyIndex

#### Create a new Loan alert with loggged in user
```http
POST /folks/repayLoan
```
All parameters are to be in req.body.A transfer of 0.01 algos is made to create a new loan alert.The password is used to authenicate transactions
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `escrowAddr` | `string` | **Required**. Address of escrow account used for loan |
| `tokenPairKeyIndex` | `string` | **Required**. token pair index used for loan |
| `password` | `string` | **Required**. password used to authenticate transactions |
response.body
```bash
{   status:true,
    message:"Loan repayed"}
```

## Demo
Working link at 



