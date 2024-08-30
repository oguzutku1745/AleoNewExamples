program buy_coffee.aleo;

record money:
    owner as address.private;
    amount as u64.private;


function create_money:
    input r0 as address.private;
    input r1 as u64.private;
    cast r0 r1 into r2 as money.record;
    output r2 as money.record;


function buy_coffee:
    input r0 as money.record;
    input r1 as address.private;
    input r2 as u64.private;
    sub r0.amount r2 into r3;
    cast r0.owner r3 into r4 as money.record;
    cast r1 r2 into r5 as money.record;
    output r4 as money.record;
    output r5 as money.record;


function combine_money:
    input r0 as money.record;
    input r1 as money.record;
    add r0.amount r1.amount into r2;
    cast r0.owner r2 into r3 as money.record;
    output r3 as money.record;


function split_money:
    input r0 as money.record;
    input r1 as u64.private;
    cast r0.owner r1 into r2 as money.record;
    sub r0.amount r1 into r3;
    cast r0.owner r3 into r4 as money.record;
    output r2 as money.record;
    output r4 as money.record;
