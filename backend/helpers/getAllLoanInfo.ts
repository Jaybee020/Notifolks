import { tokenPairKeys } from "../app";
import { algodClient, indexerClient} from "../config"
import { TestnetPoolsKey,getLoanInfo , TestnetTokenPairsKey,TestnetTokenPairs,TestnetReserveAddress,TokenPair
        ,getOraclePrices,getConversionRate,getPoolInfo,getTokenPairInfo,TestnetOracle,getLoansInfo, LoanInfo } from "../src"

interface Info{
    loanEscrow:string,
    loanUser:string,
    tokenPairKey:TestnetTokenPairsKey
    borrowedAmount:number,
    collateralBallance:number,
    borrowedBalance:number
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

export async function getAllLoanInfo(accountAddr:string){
    const oracle = TestnetOracle;
    const AllUserLoan:Info[]=[]

    await Promise.all(tokenPairKeys.map(async(tokenPairKey)=>{
        const tokenPair = TestnetTokenPairs[tokenPairKey];
        const reserveAddress = TestnetReserveAddress;
        const { collateralPool, borrowPool } = tokenPair;

         // get conversion rate
        const { prices } = await getOraclePrices(indexerClient, oracle, [collateralPool.assetId, borrowPool.assetId]);
        const conversionRate = getConversionRate(prices[collateralPool.assetId].price, prices[borrowPool.assetId].price);

        // get collateral pool and token pair info
        const collateralPoolInfo = await getPoolInfo(indexerClient, collateralPool);
        const borrowPoolInfo = await getPoolInfo(indexerClient, borrowPool);
        const tokenPairInfo = await getTokenPairInfo(indexerClient, tokenPair);

        // loop through escrows
        let loansInfo = await getLoansInfo(indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate);
        let loans = loansInfo.loans;
        let nextToken = loansInfo.nextToken;
        //get Loans specified to User
        loans.forEach((loan)=>{
            if(loan.userAddress==accountAddr){
                AllUserLoan.push({
                    tokenPairKey:tokenPairKey,
                    loanEscrow:loan.escrowAddress,
                    loanUser:loan.userAddress,
                    borrowedAmount:Number(loan.borrowed),
                    collateralBallance:Number(loan.collateralBalance),
                    borrowedBalance:Number(loan.borrowBalance)
                })
            }
        
        
        })

        while (nextToken !== undefined) {
            // sleep for 0.1 seconds to prevent hitting request limit
            await sleep(100);
            // next loop of escrows
            loansInfo = await getLoansInfo(indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, nextToken);
            loans = loansInfo.loans;
            nextToken = loansInfo.nextToken;
            loans.forEach((loan)=>{
                if(loan.userAddress==accountAddr){
                    AllUserLoan.push({
                        tokenPairKey:tokenPairKey,
                        loanEscrow:loan.escrowAddress,
                        loanUser:loan.userAddress,
                        borrowedAmount:Number(loan.borrowed),
                        collateralBallance:Number(loan.collateralBalance),
                        borrowedBalance:Number(loan.borrowBalance)
                    })
                }
            
            
            })
    }
    }))
    return AllUserLoan

}
