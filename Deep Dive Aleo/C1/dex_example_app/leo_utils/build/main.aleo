program test_utils.aleo;

struct TokenOwner:
    account as address;
    token_id as field;

struct Allowance:
    account as address;
    spender as address;
    token_id as field;

struct PairKeyData:
    token_a as field;
    token_b as field;


function get_balance_key:
    input r0 as field.public;
    input r1 as address.public;
    cast r1 r0 into r2 as TokenOwner;
    hash.bhp256 r2 into r3 as field;
    output r3 as field.private;


function swap_needed_keys:
    input r0 as address.public;
    input r1 as address.public;
    input r2 as field.public;
    input r3 as field.public;
    cast r0 r1 r2 into r4 as Allowance;
    hash.bhp256 r4 into r5 as field;
    cast r0 r1 r3 into r6 as Allowance;
    hash.bhp256 r6 into r7 as field;
    lt r2 r3 into r8;
    assert.eq r8 true;
    cast r2 r3 into r9 as PairKeyData;
    hash.bhp256 r9 into r10 as field;
    output r5 as field.private;
    output r7 as field.private;
    output r10 as field.private;
