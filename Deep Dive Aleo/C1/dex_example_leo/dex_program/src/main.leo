import credits.aleo;
import token_registry.aleo;
import test_token_14.aleo;

// The 'test_swap' program.
program test_swap_14.aleo {

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

    transition find_address(a: address) -> address {

        return a;
    }

// ########################################### LIQUIDITY ##################################################
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

        let pid: field = get_pair_id(token_a, token_b);
        let liquidity: u128 = sqrt_u128(amount_a * amount_b);

        let f2: Future = test_token_14.aleo/register_token(pid);
        let f3: Future = token_registry.aleo/mint_public(pid, self.caller, liquidity as u128, 4294967295u32);

        return finalize_create_pair(token_a, token_b, amount_a, amount_b, liquidity as u128,pid, self.caller, f0, f1,f2,f3);
    }

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


        assert(liquidity > 0u128);

        // Get the pair. It shouldn't exist, so use the TokenMetadata and provide the supply as 0. If it already exists, transaction will revert.
        let ti_pair: TokenMetadata = token_registry.aleo/registered_tokens.get_or_use(pid, TokenMetadata {
            token_id: pid,
            name: 1414743380u128, // AleoSwap-Pair
            symbol: 5526356u128, // ASP
            decimals: 6u8,
            supply: 0u128,
            max_supply: 10_000_000_000_000_000u128,
            admin: test_token_14.aleo,
            external_authorization_required: false,
            external_authorization_party: self.address,
        });
        assert_eq(ti_pair.supply, liquidity);

        // Get the pair, or use it as 0
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
    
    async transition add_liquidity(
        public token_a: field,
        public token_b: field,
        public amount_a: u128,
        public amount_b: u128,
        public supply: u128,
        public reserve_a: u128,
        public reserve_b: u128
     ) -> Future {
        assert(amount_a > 0u128);
        assert(amount_b > 0u128);
        assert(reserve_a > reserve_b);


        let pid: field = get_pair_id(token_a, token_b);
        let liq_a: u128 = amount_a * supply / reserve_a;
        let liq_b: u128 = amount_b * supply / reserve_b;

        let required_amount_b: u128 = (amount_a * reserve_b) / reserve_a;
        
        let liquidity: u128 = liq_a <= liq_b ? liq_a : liq_b;

        let f2: Future = token_registry.aleo/mint_public(pid, self.caller, liquidity,  4294967295u32);

        let f0 : Future = token_registry.aleo/transfer_from_public(token_a, self.caller, self.address, amount_a);
        let f1 : Future = token_registry.aleo/transfer_from_public(token_b, self.caller, self.address, required_amount_b);

        return finalize_add_liquidity(token_a, token_b, reserve_a, reserve_b, supply, liquidity, amount_a, required_amount_b, pid, self.caller, f0, f1,f2);
    }

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

        let pair: Pair = pairs.get(pid);
        let ti_pair: TokenMetadata = token_registry.aleo/registered_tokens.get(pid);

        assert_eq(reserve_a, pair.reserve_a);
        assert_eq(reserve_b, pair.reserve_b);
        assert_eq(supply + liquidity, ti_pair.supply);
        assert(liquidity > 0u128);

        // update pair
        pairs.set(pid, Pair {
            reserve_a: pair.reserve_a + amount_a,
            reserve_b: pair.reserve_b + amount_b,
        });

    }

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

        // calculate token amounts
        let amount_a: u128 = liquidity * reserve_a / supply;
        let amount_b: u128 = liquidity * reserve_b / supply;

        let f1 : Future = token_registry.aleo/approve_public(token_a, self.address, amount_a); 
        let f2 : Future = token_registry.aleo/approve_public(token_b, self.address, amount_b); 

        let f3 : Future = token_registry.aleo/transfer_from_public(token_a, self.address, self.caller, amount_a);
        let f4 : Future = token_registry.aleo/transfer_from_public(token_b, self.address, self.caller, amount_b);

        return finalize_remove_liquidity(self.caller, pid, token_a, token_b, reserve_a, reserve_b, liquidity, supply, amount_a, amount_b, f0, f1, f2, f3, f4);
    }

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

        assert_eq(reserve_a, pair.reserve_a);
        assert_eq(reserve_b, pair.reserve_b);
        assert_eq(supply - liquidity, ti_pair.supply);
        

        assert(amount_a > 0u128 || amount_b > 0u128);

        // update pair
        pairs.set(pid, Pair {
            reserve_a: pair.reserve_a - amount_a,
            reserve_b: pair.reserve_b - amount_b,
        });
    }

// ########################################### SWAP ##################################################

    async transition swap_exact_tokens_for_tokens(
        public token_in: field,
        public token_out: field,
        public amount_in: u128,
        public reserve_a: u128,
        public reserve_b: u128,
        public to: address,
     ) -> Future {
        assert(token_in != token_out);
        assert(amount_in > 0u128);

        let token_a: field = token_in < token_out ? token_in : token_out;
        let token_b: field = token_in < token_out ? token_out : token_in;

        // calculate output amount
        let reserve_in: u128 = token_a == token_in ? reserve_a : reserve_b;
        let reserve_out: u128 = token_a == token_out ? reserve_a : reserve_b;
        let amount_out: u128 = amount_in * reserve_out / (reserve_in + amount_in);

        assert(amount_out > 0u128);

        let f0 : Future = token_registry.aleo/approve_public(token_out, self.address, amount_out); 
        let f1 : Future = token_registry.aleo/transfer_from_public(token_in, to, self.address, amount_in);
        let f2 : Future = token_registry.aleo/transfer_from_public(token_out, self.address, to, amount_out);

        let pid: field = get_pair_id(token_a, token_b);

        return finalize_swap_exact_tokens_for_tokens(self.caller, pid, token_in, token_out, amount_in, amount_out, reserve_in, reserve_out, reserve_a, reserve_b, f0, f1, f2);
    }

    async function finalize_swap_exact_tokens_for_tokens(
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

        assert_eq(pair.reserve_a, reserve_a);
        assert_eq(pair.reserve_b, reserve_b);

        let token_a: field = token_in < token_out ? token_in : token_out;
        let token_b: field = token_in < token_out ? token_out : token_in;


        // update pair
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
