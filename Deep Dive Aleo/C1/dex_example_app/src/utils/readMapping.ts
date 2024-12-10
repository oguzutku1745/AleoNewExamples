// utils/tokenRegistry.js
import { AleoNetworkClient } from '@provablehq/sdk';

const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");

export async function getAllowanceMapping(field:string) {
    try {
        const allowancesMapping = await networkClient.getProgramMappingValue("token_registry.aleo", "allowances", field);
        return allowancesMapping;
    } catch (error) {
        console.error("Error fetching allowances:", error);
        throw error;
    }
}

export async function getAllowancesForLiquidity(field_1: string, field_2: string) {
    try{
        const allowances_1 = await networkClient.getProgramMappingValue("token_registry.aleo", "allowances", field_1);
        const allowances_2 = await networkClient.getProgramMappingValue("token_registry.aleo", "allowances", field_2);
        return {allowances_1, allowances_2};
    } catch (error) {
        console.error("Error fetching allowances: ",error);
        throw error;
    }
}

export async function getPairData(field:string) {
    try {
        const pairData = await networkClient.getProgramMappingValue("test_swap_15.aleo", "pairs", field);
        return pairData
    } catch (error) {
        console.error("Error fetching pair data: ", error);
        throw error;
    }
}

export async function getBalanceData(field:string) {
    try {
        const balanceData = await networkClient.getProgramMappingValue("token_registry.aleo", "authorized_balances", field);
        return balanceData
    } catch (error) {
        console.error("Error fetching pair data: ", error);
        throw error;
    }
}

export async function getRegisteredTokenData(field:string) {
    try {
        const balanceData = await networkClient.getProgramMappingValue("token_registry.aleo", "registered_tokens", field);
        return balanceData
    } catch (error) {
        console.error("Error fetching pair data: ", error);
        throw error;
    }
}