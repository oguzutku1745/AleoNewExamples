import credits.aleo;
import token_registry.aleo;
program test_token_14.aleo;


struct TokenMetadata:
    token_id as field;
    name as u128;
    symbol as u128;
    decimals as u8;
    supply as u128;
    max_supply as u128;
    admin as address;
    external_authorization_required as boolean;
    external_authorization_party as address;

struct TokenOwner:
    account as address;
    token_id as field;




function register_token:
    input r0 as field.public;
    assert.eq self.caller test_swap_14.aleo;
    call token_registry.aleo/register_token r0 1414743380u128 5526356u128 6u8 1_000_000_000_000_000u128 false test_swap_14.aleo into r1;
    call token_registry.aleo/set_role r0 test_swap_14.aleo 3u8 into r2;
    async register_token r1 r2 into r3;
    output r3 as test_token_14.aleo/register_token.future;

finalize register_token:
    input r0 as token_registry.aleo/register_token.future;
    input r1 as token_registry.aleo/set_role.future;
    await r0;
    await r1;

