// The 'test_allowances' program.
program test_utils.aleo {

  struct TokenOwner {
    account: address,
    token_id: field
  }

    struct Allowance {
    account: address,
    spender: address,
    token_id: field
  }

    // Mapping key of pairs
    struct PairKeyData {
        token_a: field,
        token_b: field,
    }

    transition get_balance_key( public token_id: field, public account:address) -> field {

        let token_owner: TokenOwner = TokenOwner {
          account: account,
          token_id: token_id
        };

        let balance_key: field = BHP256::hash_to_field(token_owner);

     return balance_key;
    }

    transition swap_needed_keys(public owner:address, public spender:address, public token_id_in:field, public token_id_out:field) -> (field, field,field) {
        let allowance_1: Allowance = Allowance {
          account: owner,
          spender: spender,
          token_id: token_id_in
        };
        let allowance_key_1: field = BHP256::hash_to_field(allowance_1);

        let allowance_2: Allowance = Allowance {
          account:owner,
          spender:spender,
          token_id: token_id_out
        };

        let allowance_key_2: field = BHP256::hash_to_field(allowance_2);

        assert(token_id_in < token_id_out);
        let token_a: field = token_id_in;
        let token_b: field = token_id_out;
        let pid:field = BHP256::hash_to_field(PairKeyData {token_a, token_b});

        return (allowance_key_1, allowance_key_2, pid);

    }

}
