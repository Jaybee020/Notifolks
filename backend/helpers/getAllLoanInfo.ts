import { tokenPairKeys } from "../app";
import { algodClient, indexerClient} from "../config"
import { TestnetPoolsKey,getLoanInfo , TestnetTokenPairsKey,TestnetTokenPairs,TestnetReserveAddress,TokenPair
        ,getOraclePrices,getConversionRate,getPoolInfo,getTokenPairInfo,TestnetOracle,getLoansInfo, LoanInfo } from "../src"

interface Info{
    loanEscrow:string,
    borrowedAmount:number,
    collateralBalance:number,
    borrowedBalance:number
}


export async function getAllLoanInfo(accountAddr:string,tokenPairKey:TestnetTokenPairsKey){
    const oracle = TestnetOracle;
    const AllUserLoan:Info[]=[]

    const tokenPair = TestnetTokenPairs[tokenPairKey];
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
                    loanEscrow:loan.escrowAddress,
                    borrowedAmount:Number(loan.borrowed),
                    collateralBalance:Number(loan.collateralBalance),
                    borrowedBalance:Number(loan.borrowBalance)
                })
            }
        
        
        })

        while (nextToken !== undefined) {
            // next loop of escrows
            loansInfo = await getLoansInfo(indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, nextToken);
            loans = loansInfo.loans;
            nextToken = loansInfo.nextToken;
            loans.forEach((loan)=>{
                if(loan.userAddress==accountAddr){
                    AllUserLoan.push({
                        loanEscrow:loan.escrowAddress,
                        borrowedAmount:Number(loan.borrowed),
                        collateralBalance:Number(loan.collateralBalance),
                        borrowedBalance:Number(loan.borrowBalance)
                    })
                }
            
            
            })
    }
    return AllUserLoan

}
