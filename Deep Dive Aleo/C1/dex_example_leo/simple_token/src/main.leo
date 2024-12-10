import token_registry.aleo;

// The 'simple_token' program.
program simple_token_7.aleo {


  struct TokenOwner {
    account: address,
    token_id: field
  }
  
  async transition initialize(pid:field) -> Future {

    let r0: Future = token_registry.aleo/register_token(
      pid, // token_id: field
      216163108180u128, // name: u128, CATNOHAT ascii encoded
      5526356u128, // symbol: u128, CATNOHAT ascii encoded
      6u8, // decimals: u8
      1_000_000_000_000_000u128, // max_supply: u128
      false, // external_authorization_required: boolean
      self.address // external_authorization_party: address
    );

    let r1: Future = token_registry.aleo/set_role(
      pid,
      self.caller,
      1u8 // SUPPLY_MANAGER_ROLE
      );
    return initialize_future(r0, r1);
  }

  async function initialize_future(
    r0: Future,
    r1: Future
  ) {
    r0.await();
    r1.await();
  }

  async transition mint_public(pid:field) -> Future {
    let r0: Future = token_registry.aleo/mint_public(
      pid, // token_id: field
      self.caller,
      1_000_000_000_000_000u128,
      4_294_967_295u32
    );
    return finalize_mint_public(r0);
  }

  async function finalize_mint_public(r0:Future) {
    r0.await();
  }
}