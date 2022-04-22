
# NotiFolks 
Powered by `folks-finance-js-sdk`
Notifolks is a web app that provides the following services
1. Allow users view their several loan informations on folks-finance. 
2. Allow users to set email reminder health ratio for their loans after paying a fee of 0.1fAlgo.
3. Allows users to repay their loan.

Check backend folder for API routing endpoints and frontend folder for website frontend.

# FEATURES
1. All transactions are prepared by the backend and sent to the client side.
2. Client side uses myalgoconnect to sign transactions.
3. An amount of 0.1 folks Algo is required to create a new loan alert(to ensure user is the one creating the alert and service fee)
4. Loan alert notifications are sent to mail.

`The account to be used should have opted in for the neccesaary assets and should have enough balance to complete transactions`



## Demo
Working link at https://notifolks.netlify.app 