import token_registry.aleo;

// The 'simple_token' program.
program test_token_14.aleo {

  struct TokenOwner {
    account: address,
    token_id: field
  }
  
  async transition register_token(
    public pid: field,
  ) -> Future {
    assert_eq(self.caller, test_swap_14.aleo);
    let r0: Future = token_registry.aleo/register_token(
      pid, // token_id: field
      1414743380u128, // name: u128, TEST ascii encoded
      5526356u128, // symbol: u128, TST ascii encoded
      6u8, // decimals: u8
      1_000_000_000_000_000u128, // max_supply: u128
      false, // external_authorization_required: boolean
      test_swap_14.aleo // external_authorization_party: address
    );
    let r1: Future = token_registry.aleo/set_role(
      pid, // token_id: field
      test_swap_14.aleo,
      3u8
    );
    return finalize_register_token(r0, r1);
  }

  async function finalize_register_token(r0: Future,r1: Future) {
    r0.await();
    r1.await();
  }
}