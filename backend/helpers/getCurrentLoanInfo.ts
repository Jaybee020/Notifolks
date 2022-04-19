import { algodClient, indexerClient} from "../config"
import { TestnetPoolsKey,getLoanInfo , TestnetTokenPairsKey,TestnetTokenPairs,TestnetReserveAddress,TokenPair
        ,getOraclePrices,getConversionRate,getPoolInfo,getTokenPairInfo,TestnetOracle } from "../src"


export const getCurrentLoanInfo =async (escrowAddr:string,tokenPairKey:TestnetTokenPairsKey) => {

    const oracle = TestnetOracle;
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

    
    const loan=await getLoanInfo(indexerClient,tokenPair,oracle,escrowAddr)
    return loan
}