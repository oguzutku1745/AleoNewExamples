import credits.aleo;
import token_registry.aleo;
import test_token_14.aleo;
program test_swap_14.aleo;


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


struct Pair:
    reserve_a as u128;
    reserve_b as u128;

struct PairKeyData:
    token_a as field;
    token_b as field;


mapping pairs:
	key as field.public;
	value as Pair.public;

function find_address:
    input r0 as address.private;
    output r0 as address.private;











function create_pair:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    gt r2 0u128 into r4;
    assert.eq r4 true;
    gt r3 0u128 into r5;
    assert.eq r5 true;
    call token_registry.aleo/transfer_from_public r0 self.caller test_swap_14.aleo r2 into r6;
    call token_registry.aleo/transfer_from_public r1 self.caller test_swap_14.aleo r3 into r7;
    lt r0 r1 into r8;
    assert.eq r8 true;
    cast r0 r1 into r9 as PairKeyData;
    hash.bhp256 r9 into r10 as field;
    mul r2 r3 into r11;
    is.eq r11 0u128 into r12;
    shr r11 64u32 into r13;
    gt r13 0u128 into r14;
    shr r11 64u32 into r15;
    add 0u32 64u32 into r16;
    ternary r14 r15 r11 into r17;
    ternary r14 r16 0u32 into r18;
    shr r17 32u32 into r19;
    gt r19 0u128 into r20;
    shr r17 32u32 into r21;
    add r18 32u32 into r22;
    ternary r20 r21 r17 into r23;
    ternary r20 r22 r18 into r24;
    shr r23 16u32 into r25;
    gt r25 0u128 into r26;
    shr r23 16u32 into r27;
    add r24 16u32 into r28;
    ternary r26 r27 r23 into r29;
    ternary r26 r28 r24 into r30;
    shr r29 8u32 into r31;
    gt r31 0u128 into r32;
    shr r29 8u32 into r33;
    add r30 8u32 into r34;
    ternary r32 r33 r29 into r35;
    ternary r32 r34 r30 into r36;
    shr r35 4u32 into r37;
    gt r37 0u128 into r38;
    shr r35 4u32 into r39;
    add r36 4u32 into r40;
    ternary r38 r39 r35 into r41;
    ternary r38 r40 r36 into r42;
    shr r41 2u32 into r43;
    gt r43 0u128 into r44;
    shr r41 2u32 into r45;
    add r42 2u32 into r46;
    ternary r44 r45 r41 into r47;
    ternary r44 r46 r42 into r48;
    shr r47 1u32 into r49;
    gt r49 0u128 into r50;
    add r48 1u32 into r51;
    ternary r50 r51 r48 into r52;
    div r52 2u32 into r53;
    shl 1u128 r53 into r54;
    div r11 r54 into r55;
    add r54 r55 into r56;
    shr r56 1u32 into r57;
    div r11 r57 into r58;
    add r57 r58 into r59;
    shr r59 1u32 into r60;
    div r11 r60 into r61;
    add r60 r61 into r62;
    shr r62 1u32 into r63;
    div r11 r63 into r64;
    add r63 r64 into r65;
    shr r65 1u32 into r66;
    div r11 r66 into r67;
    add r66 r67 into r68;
    shr r68 1u32 into r69;
    div r11 r69 into r70;
    add r69 r70 into r71;
    shr r71 1u32 into r72;
    div r11 r72 into r73;
    add r72 r73 into r74;
    shr r74 1u32 into r75;
    div r11 r75 into r76;
    lt r75 r76 into r77;
    ternary r77 r75 r76 into r78;
    ternary r12 0u128 r78 into r79;
    call test_token_14.aleo/register_token r10 into r80;
    cast r79 into r81 as u128;
    call token_registry.aleo/mint_public r10 self.caller r81 4294967295u32 into r82;
    cast r79 into r83 as u128;
    async create_pair r0 r1 r2 r3 r83 r10 self.caller r6 r7 r80 r82 into r84;
    output r84 as test_swap_14.aleo/create_pair.future;

finalize create_pair:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as u128.public;
    input r5 as field.public;
    input r6 as address.public;
    input r7 as token_registry.aleo/transfer_from_public.future;
    input r8 as token_registry.aleo/transfer_from_public.future;
    input r9 as test_token_14.aleo/register_token.future;
    input r10 as token_registry.aleo/mint_public.future;
    await r7;
    await r8;
    await r9;
    await r10;
    gt r4 0u128 into r11;
    assert.eq r11 true;
    cast r5 1414743380u128 5526356u128 6u8 0u128 10_000_000_000_000_000u128 test_token_14.aleo false test_swap_14.aleo into r12 as TokenMetadata;
    get.or_use token_registry.aleo/registered_tokens[r5] r12 into r13;
    assert.eq r13.supply r4;
    cast 0u128 0u128 into r14 as Pair;
    get.or_use pairs[r5] r14 into r15;
    add r15.reserve_a r2 into r16;
    add r15.reserve_b r3 into r17;
    cast r16 r17 into r18 as Pair;
    set r18 into pairs[r5];




function add_liquidity:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as u128.public;
    input r5 as u128.public;
    input r6 as u128.public;
    gt r2 0u128 into r7;
    assert.eq r7 true;
    gt r3 0u128 into r8;
    assert.eq r8 true;
    gt r5 r6 into r9;
    assert.eq r9 true;
    lt r0 r1 into r10;
    assert.eq r10 true;
    cast r0 r1 into r11 as PairKeyData;
    hash.bhp256 r11 into r12 as field;
    mul r2 r4 into r13;
    div r13 r5 into r14;
    mul r3 r4 into r15;
    div r15 r6 into r16;
    mul r2 r6 into r17;
    div r17 r5 into r18;
    lte r14 r16 into r19;
    ternary r19 r14 r16 into r20;
    call token_registry.aleo/mint_public r12 self.caller r20 4294967295u32 into r21;
    call token_registry.aleo/transfer_from_public r0 self.caller test_swap_14.aleo r2 into r22;
    call token_registry.aleo/transfer_from_public r1 self.caller test_swap_14.aleo r18 into r23;
    async add_liquidity r0 r1 r5 r6 r4 r20 r2 r18 r12 self.caller r22 r23 r21 into r24;
    output r24 as test_swap_14.aleo/add_liquidity.future;

finalize add_liquidity:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as u128.public;
    input r5 as u128.public;
    input r6 as u128.public;
    input r7 as u128.public;
    input r8 as field.public;
    input r9 as address.public;
    input r10 as token_registry.aleo/transfer_from_public.future;
    input r11 as token_registry.aleo/transfer_from_public.future;
    input r12 as token_registry.aleo/mint_public.future;
    await r10;
    await r11;
    await r12;
    get pairs[r8] into r13;
    get token_registry.aleo/registered_tokens[r8] into r14;
    assert.eq r2 r13.reserve_a;
    assert.eq r3 r13.reserve_b;
    add r4 r5 into r15;
    assert.eq r15 r14.supply;
    gt r5 0u128 into r16;
    assert.eq r16 true;
    add r13.reserve_a r6 into r17;
    add r13.reserve_b r7 into r18;
    cast r17 r18 into r19 as Pair;
    set r19 into pairs[r8];




function remove_liquidity:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as u128.public;
    input r5 as u128.public;
    input r6 as address.public;
    gt r2 0u128 into r7;
    assert.eq r7 true;
    lt r0 r1 into r8;
    assert.eq r8 true;
    cast r0 r1 into r9 as PairKeyData;
    hash.bhp256 r9 into r10 as field;
    call token_registry.aleo/burn_public r10 self.caller r2 into r11;
    mul r2 r4 into r12;
    div r12 r3 into r13;
    mul r2 r5 into r14;
    div r14 r3 into r15;
    call token_registry.aleo/approve_public r0 test_swap_14.aleo r13 into r16;
    call token_registry.aleo/approve_public r1 test_swap_14.aleo r15 into r17;
    call token_registry.aleo/transfer_from_public r0 test_swap_14.aleo self.caller r13 into r18;
    call token_registry.aleo/transfer_from_public r1 test_swap_14.aleo self.caller r15 into r19;
    async remove_liquidity self.caller r10 r0 r1 r4 r5 r2 r3 r13 r15 r11 r16 r17 r18 r19 into r20;
    output r20 as test_swap_14.aleo/remove_liquidity.future;

finalize remove_liquidity:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as field.public;
    input r4 as u128.public;
    input r5 as u128.public;
    input r6 as u128.public;
    input r7 as u128.public;
    input r8 as u128.public;
    input r9 as u128.public;
    input r10 as token_registry.aleo/burn_public.future;
    input r11 as token_registry.aleo/approve_public.future;
    input r12 as token_registry.aleo/approve_public.future;
    input r13 as token_registry.aleo/transfer_from_public.future;
    input r14 as token_registry.aleo/transfer_from_public.future;
    await r10;
    await r11;
    await r12;
    await r13;
    await r14;
    get pairs[r1] into r15;
    get token_registry.aleo/registered_tokens[r1] into r16;
    assert.eq r4 r15.reserve_a;
    assert.eq r5 r15.reserve_b;
    sub r7 r6 into r17;
    assert.eq r17 r16.supply;
    gt r8 0u128 into r18;
    gt r9 0u128 into r19;
    or r18 r19 into r20;
    assert.eq r20 true;
    sub r15.reserve_a r8 into r21;
    sub r15.reserve_b r9 into r22;
    cast r21 r22 into r23 as Pair;
    set r23 into pairs[r1];




function swap_exact_tokens_for_tokens:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u128.public;
    input r3 as u128.public;
    input r4 as u128.public;
    input r5 as address.public;
    is.neq r0 r1 into r6;
    assert.eq r6 true;
    gt r2 0u128 into r7;
    assert.eq r7 true;
    lt r0 r1 into r8;
    ternary r8 r0 r1 into r9;
    lt r0 r1 into r10;
    ternary r10 r1 r0 into r11;
    is.eq r9 r0 into r12;
    ternary r12 r3 r4 into r13;
    is.eq r9 r1 into r14;
    ternary r14 r3 r4 into r15;
    mul r2 r15 into r16;
    add r13 r2 into r17;
    div r16 r17 into r18;
    gt r18 0u128 into r19;
    assert.eq r19 true;
    call token_registry.aleo/approve_public r1 test_swap_14.aleo r18 into r20;
    call token_registry.aleo/transfer_from_public r0 r5 test_swap_14.aleo r2 into r21;
    call token_registry.aleo/transfer_from_public r1 test_swap_14.aleo r5 r18 into r22;
    lt r9 r11 into r23;
    assert.eq r23 true;
    cast r9 r11 into r24 as PairKeyData;
    hash.bhp256 r24 into r25 as field;
    async swap_exact_tokens_for_tokens self.caller r25 r0 r1 r2 r18 r13 r15 r3 r4 r20 r21 r22 into r26;
    output r26 as test_swap_14.aleo/swap_exact_tokens_for_tokens.future;

finalize swap_exact_tokens_for_tokens:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as field.public;
    input r4 as u128.public;
    input r5 as u128.public;
    input r6 as u128.public;
    input r7 as u128.public;
    input r8 as u128.public;
    input r9 as u128.public;
    input r10 as token_registry.aleo/approve_public.future;
    input r11 as token_registry.aleo/transfer_from_public.future;
    input r12 as token_registry.aleo/transfer_from_public.future;
    await r10;
    await r11;
    await r12;
    get pairs[r1] into r13;
    assert.eq r13.reserve_a r8;
    assert.eq r13.reserve_b r9;
    lt r2 r3 into r14;
    ternary r14 r2 r3 into r15;
    lt r2 r3 into r16;
    ternary r16 r3 r2 into r17;
    add r6 r4 into r18;
    sub r7 r5 into r19;
    is.eq r15 r2 into r20;
    ternary r20 r18 r19 into r21;
    is.eq r17 r2 into r22;
    ternary r22 r18 r19 into r23;
    cast r21 r23 into r24 as Pair;
    set r24 into pairs[r1];

