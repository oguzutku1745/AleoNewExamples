import credits.aleo;
import token_registry.aleo;
import test_token_15.aleo;

// The 'test_swap' program.
program test_swap_15.aleo {

    struct TokenOwner {
      account: address,
      token_id: field
    }

    mapping pairs: field => Pair;

    struct BalanceKeyData {
        token: field,
        user: address,
    }

    struct Pair {
        reserve_a: u128,
        reserve_b: u128,
    }

    // Mapping key of pairs
    struct PairKeyData {
        token_a: field,
        token_b: field,
    }

    struct TokenMetadata {
      token_id: field,
      name: u128, // ASCII text represented in bits, and the u128 value of the bitstring
      symbol: u128, // ASCII text represented in bits, and the u128 value of the bitstring
      decimals: u8,
      supply: u128,
      max_supply: u128,
      admin: address,
      external_authorization_required: bool, // whether or not this token requires authorization from an external program before transferring
      external_authorization_party: address
    }

// ########################################### TOOLS ##################################################

//  A transition to find the address of the Aleo program
    transition find_address(a: address) -> address {

        return a;
    }

// ########################################### LIQUIDITY ##################################################

//  Creates pair with 2 tokens. Approve public function from token_registry.aleo should be called by a person for both tokens before creating pair.
    async transition create_pair(
        public token_a: field,
        public token_b: field,
        public amount_a: u128,
        public amount_b: u128,
     ) -> Future {
        assert(amount_a > 0u128); 
        assert(amount_b > 0u128);

        let f0 : Future = token_registry.aleo/transfer_from_public(token_a, self.caller, self.address, amount_a);
        let f1 : Future = token_registry.aleo/transfer_from_public(token_b, self.caller, self.address, amount_b);

        // Generates pid for liquidity token by BHP256::hash_to_field(token_a, token_b)
        let pid: field = get_pair_id(token_a, token_b);

        // Calculates the amount of liquidity tokens should be minted by taking the square root of (amount_a * amount_b)
        let liquidity: u128 = sqrt_u128(amount_a * amount_b);

        // Registers the liquditiy token
        let f2: Future = test_token_15.aleo/register_token(pid);

        // Minting liquidity token
        let f3: Future = token_registry.aleo/mint_public(pid, self.caller, liquidity as u128, 4294967295u32);

        return finalize_create_pair(token_a, token_b, amount_a, amount_b, liquidity as u128,pid, self.caller, f0, f1,f2,f3);
    }

//  On-chain finalization of the creating the pair.
    async function finalize_create_pair(
        public token_a: field,
        public token_b: field,
        public amount_a: u128,
        public amount_b: u128,
        public liquidity: u128,
        public pid: field,
        public to: address,
        public f0: Future,
        public f1: Future,
        public f2: Future,
        public f3: Future
    ) {
        f0.await();
        f1.await();
        f2.await();
        f3.await();

        // Get the pair. It shouldn't exist, so use the TokenMetadata and provide the supply as 0. If it already exists, transaction will revert.
        let ti_pair: TokenMetadata = token_registry.aleo/registered_tokens.get_or_use(pid, TokenMetadata {
            token_id: pid,
            name: 1414743380u128, // Name of the DEX
            symbol: 5526356u128, // Symbol of the DEX
            decimals: 6u8,
            supply: 0u128,
            max_supply: 10_000_000_000_000_000u128,
            admin: test_token_15.aleo, // Set the admin to test_token_15.aleo since the admin is initialized as self.caller in token_registry.aleo.
            external_authorization_required: false,
            external_authorization_party: self.address,
        });

        // Check if the liquidity is the same with one that we passed from async transition.
        assert_eq(ti_pair.supply, liquidity);

        // Get the pair, or use it as 0. It shouldn't exist.
        let pair: Pair = pairs.get_or_use(pid, Pair {
            reserve_a: 0u128,
            reserve_b: 0u128,
        });

        // update pair
        pairs.set(pid, Pair {
            reserve_a: pair.reserve_a + amount_a,
            reserve_b: pair.reserve_b + amount_b,
        });

    }
    
//  Adds liquidity to already created pair. Note that the approval amount should be sufficient to add them to the pool.
    async transition add_liquidity(
        public token_a: field,
        public token_b: field,
        public amount_a: u128,
        public amount_b: u128,
        public supply: u128,
        public reserve_a: u128,
        public reserve_b: u128
     ) -> Future {

        // Check the amounts for a and b.
        assert(amount_a > 0u128);
        assert(amount_b > 0u128);

        // Check the order of reserves to make sure that the reserves are in the same order with the created pair.
        let pid: field = get_pair_id(token_a, token_b);

        // Calculate the liquidity fraction of each pair
        let liq_a: u128 = amount_a * supply / reserve_a;
        let liq_b: u128 = amount_b * supply / reserve_b;

        // Calculate the required amount of token_b to provide along with token_a amount
        let required_amount_b: u128 = (amount_a * reserve_b) / reserve_a;
        
        // Choose the liquidity fraction which is smaller to mint the lp tokens depends on that amount.
        let liquidity: u128 = liq_a <= liq_b ? liq_a : liq_b;

        // Mint the added liquidity
        let f2: Future = token_registry.aleo/mint_public(pid, self.caller, liquidity,  4294967295u32);

        // Transfer the token_a and token_b to test_swap program
        let f0 : Future = token_registry.aleo/transfer_from_public(token_a, self.caller, self.address, amount_a);
        let f1 : Future = token_registry.aleo/transfer_from_public(token_b, self.caller, self.address, required_amount_b);

        return finalize_add_liquidity(token_a, token_b, reserve_a, reserve_b, supply, liquidity, amount_a, required_amount_b, pid, self.caller, f0, f1,f2);
    }

//  On-chain finalization of adding liquidity.
    async function finalize_add_liquidity(
        public token_a: field,
        public token_b: field,
        public reserve_a: u128,
        public reserve_b: u128,
        public supply: u128,
        public liquidity: u128,
        public amount_a: u128,
        public amount_b: u128,
        public pid: field,
        public to: address,
        public f0: Future,
        public f1: Future,
        public f2: Future,
    ) {
        f0.await();
        f1.await();
        f2.await();

        // Get the pair data by pid from token_swap contract.
        let pair: Pair = pairs.get(pid);

        // Get the pair data from token_registry
        let ti_pair: TokenMetadata = token_registry.aleo/registered_tokens.get(pid);

        // Verify that reserve amounts and the supply provided from frontend is the same with on-chain data.
        assert_eq(reserve_a, pair.reserve_a);
        assert_eq(reserve_b, pair.reserve_b);
        assert_eq(supply + liquidity, ti_pair.supply);

        // update pair
        pairs.set(pid, Pair {
            reserve_a: pair.reserve_a + amount_a,
            reserve_b: pair.reserve_b + amount_b,
        });

    }

//  Removes liquidity from already created pair
    async transition remove_liquidity(
        public token_a: field,
        public token_b: field,
        public liquidity: u128,
        public supply: u128,
        public reserve_a: u128,
        public reserve_b: u128,
        public to: address,
     ) -> Future {

        assert(liquidity > 0u128);

        let pid: field = get_pair_id(token_a, token_b);
        let f0 : Future = token_registry.aleo/burn_public(pid, self.caller, liquidity);

        // Calculate amount of tokens which will be transferred back to owner. This is done by the multiplying liquidity with reserve amount then dividing by total supply.
        let amount_a: u128 = liquidity * reserve_a / supply;
        let amount_b: u128 = liquidity * reserve_b / supply;

        // This part is the approval function of the token_swap program.
        let f1 : Future = token_registry.aleo/approve_public(token_a, self.address, amount_a); 
        let f2 : Future = token_registry.aleo/approve_public(token_b, self.address, amount_b); 

        // Transfer the tokens back to owner
        let f3 : Future = token_registry.aleo/transfer_from_public(token_a, self.address, self.caller, amount_a);
        let f4 : Future = token_registry.aleo/transfer_from_public(token_b, self.address, self.caller, amount_b);

        return finalize_remove_liquidity(self.caller, pid, token_a, token_b, reserve_a, reserve_b, liquidity, supply, amount_a, amount_b, f0, f1, f2, f3, f4);
    }

//  On-chain finalization of removing liquidity.
    async function finalize_remove_liquidity(
        public caller: address,
        public pid: field,
        public token_a: field,
        public token_b: field,
        public reserve_a: u128,
        public reserve_b: u128,
        public liquidity: u128,
        public supply: u128,
        public amount_a : u128,
        public amount_b : u128,
        public f0: Future,
        public f1: Future,
        public f2: Future,
        public f3: Future,
        public f4: Future,
    ) {
        f0.await();
        f1.await();
        f2.await();
        f3.await();
        f4.await();

        let pair: Pair = pairs.get(pid);
        let ti_pair: TokenMetadata = token_registry.aleo/registered_tokens.get(pid);

        // Verify that reserve amounts and the supply provided from frontend is the same with on-chain data.
        assert_eq(reserve_a, pair.reserve_a);
        assert_eq(reserve_b, pair.reserve_b);
        assert_eq(supply - liquidity, ti_pair.supply);

        // Make sure that there is an amount to provide back to the owner.
        assert(amount_a > 0u128 || amount_b > 0u128);

        // update pair
        pairs.set(pid, Pair {
            reserve_a: pair.reserve_a - amount_a,
            reserve_b: pair.reserve_b - amount_b,
        });
    }

// ########################################### SWAP ##################################################

    // Function to swap tokens. It should be noted that the token_in should be approved by the token owner and token_out should be approved by the test_swap program.
    async transition swap_tokens_for_tokens(
        public token_in: field,
        public token_out: field,
        public amount_in: u128,
        public reserve_a: u128,
        public reserve_b: u128,
        public to: address,
     ) -> Future {

        // Tokens should be different
        assert(token_in != token_out);

        // Incoming amount should be bigger than 0
        assert(amount_in > 0u128);

        // Define the token_a according to token id parameter of token_in and token_out. Incoming token should be equal to token_a.
        let token_a: field = token_in < token_out ? token_in : token_out;
        let token_b: field = token_in < token_out ? token_out : token_in;

        // Calculate output amount
        let reserve_in: u128 = token_a == token_in ? reserve_a : reserve_b;
        let reserve_out: u128 = token_a == token_out ? reserve_a : reserve_b;

        // Calculate output amount for token_b (aka. token_out)
        let amount_out: u128 = amount_in * reserve_out / (reserve_in + amount_in);

        // Make sure that the output amount is bigger than 0.
        assert(amount_out > 0u128);

        // Approva the output token for the token_swap program
        let f0 : Future = token_registry.aleo/approve_public(token_out, self.address, amount_out); 

        // Transfer the tokens from owner to token_swap program and vice versa
        let f1 : Future = token_registry.aleo/transfer_from_public(token_in, to, self.address, amount_in);
        let f2 : Future = token_registry.aleo/transfer_from_public(token_out, self.address, to, amount_out);

        // Get pair
        let pid: field = get_pair_id(token_a, token_b);

        return finalize_swap_tokens_for_tokens(self.caller, pid, token_in, token_out, amount_in, amount_out, reserve_in, reserve_out, reserve_a, reserve_b, f0, f1, f2);
    }


//  On-chain finalization of swap tokens.
    async function finalize_swap_tokens_for_tokens(
        public caller: address,
        public pid: field,
        public token_in: field,
        public token_out: field,
        public amount_in: u128,
        public amount_out: u128,
        public reserve_in: u128,
        public reserve_out: u128,
        public reserve_a: u128,
        public reserve_b: u128,
        public f0: Future,
        public f1: Future,
        public f2: Future,
    ) {

        f0.await();
        f1.await();
        f2.await();

        let pair: Pair = pairs.get(pid);

        // Verify that reserve amounts provided from frontend is the same with on-chain data.
        assert_eq(pair.reserve_a, reserve_a);
        assert_eq(pair.reserve_b, reserve_b);

        let token_a: field = token_in < token_out ? token_in : token_out;
        let token_b: field = token_in < token_out ? token_out : token_in;


        // Update pair
        let reserve_in_new: u128 = reserve_in + amount_in;
        let reserve_out_new: u128 = reserve_out - amount_out;

        pairs.set(pid, Pair {
            reserve_a: token_a == token_in ? reserve_in_new : reserve_out_new,
            reserve_b: token_b == token_in ? reserve_in_new : reserve_out_new,
        });
    }

// ########################################### HELPERS ##################################################

    inline get_pair_id(token_a_: field, token_b_: field) -> field {
        // copy to avoid compiling error
        let token_a: field = token_a_;
        let token_b: field = token_b_;
        assert(token_a < token_b);
        return  BHP256::hash_to_field(PairKeyData {token_a, token_b});
    }

    inline sqrt_u128(a: u128) -> u128 {
        if (a == 0u128) {
            return 0u128;
        }
        let result: u128 = 1u128.shl(log2(a) / 2u32);

        result = (result + a / result) >> 1u32;
        result = (result + a / result) >> 1u32;
        result = (result + a / result) >> 1u32;
        result = (result + a / result) >> 1u32;
        result = (result + a / result) >> 1u32;
        result = (result + a / result) >> 1u32;
        result = (result + a / result) >> 1u32;
        return min_u128(result, a / result);
    }

    inline log2(value: u128) -> u32 {
        let result: u32 = 0u32;
        // if value >> 128u32 > 0u128 {
        //     value >>= 128u32;
        //     result += 12832;
        // }
        if value >> 64u32 > 0u128 {
            value >>= 64u32;
            result += 64u32;
        }
        if value >> 32u32 > 0u128 {
            value >>= 32u32;
            result += 32u32;
        }
        if value >> 16u32 > 0u128 {
            value >>= 16u32;
            result += 16u32;
        }
        if value >> 8u32 > 0u128 {
            value >>= 8u32;
            result += 8u32;
        }
        if value >> 4u32 > 0u128 {
            value >>= 4u32;
            result += 4u32;
        }
        if value >> 2u32 > 0u128 {
            value >>= 2u32;
            result += 2u32;
        }
        if value >> 1u32 > 0u128 {
            result += 1u32;
        }
        return result;
    }

    // min for u128
    inline min_u128(a: u128, b: u128) -> u128 {
        return a < b ? a : b;
    }

}
