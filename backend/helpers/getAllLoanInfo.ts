import { tokenPairKeys } from "../app";
import { algodClient, indexerClient} from "../config"
import { TestnetPoolsKey,getLoanInfo , TestnetTokenPairsKey,TestnetTokenPairs,TestnetReserveAddress,TokenPair
        ,getOraclePrices,getConversionRate,getPoolInfo,getTokenPairInfo,TestnetOracle,getLoansInfo, LoanInfo } from "../src"

interface Info{
    loanEscrow:string,
    loanUser:string,
    tokenPairKey:TestnetTokenPairsKey
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

export async function getAllLoanInfo(accountAddr:string){
    const oracle = TestnetOracle;
    const AllUserLoan:Info[]=[]

    tokenPairKeys.forEach(async(tokenPairKey)=>{
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
        const UserLoan:Info[]=loans.filter((loan)=>{loan.userAddress==accountAddr}).map((loan)=>{
            return {
                tokenPairKey:tokenPairKey,
                loanEscrow:loan.escrowAddress,
                loanUser:loan.userAddress

            }
        })
        let i=0
        AllUserLoan.push(...UserLoan)//push to overall Array
        console.log("Reached Here"+i.toString())

        while (nextToken !== undefined) {
            // sleep for 0.1 seconds to prevent hitting request limit
            await sleep(100);
            // next loop of escrows
            loansInfo = await getLoansInfo(indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, nextToken);
            loans = loansInfo.loans;
            nextToken = loansInfo.nextToken;
            const UserLoan:Info[]=loans.filter((loan)=>{loan.userAddress==accountAddr}).map((loan)=>{
                return {
                    tokenPairKey:tokenPairKey,
                    loanEscrow:loan.escrowAddress,
                    loanUser:loan.userAddress
    
                }
            })
            AllUserLoan.push(...UserLoan)
            console.log("Reached Here"+i.toString())
            i++

    }
        
    })

    AllUserLoan.forEach((aUserLoan)=>console.log(aUserLoan.loanUser))
    return AllUserLoan
}