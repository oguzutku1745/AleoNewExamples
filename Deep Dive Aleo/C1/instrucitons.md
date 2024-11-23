First, we need to initialize our tokens by interacting with simple_token_6.aleo program.
```
leo execute --program simple_token_6.aleo --broadcast initialize 216163108195field
leo execute --program simple_token_6.aleo --broadcast initialize 216163108196field
````

Note that the token id's should be changed. There is no custom limitations regarding the id and anything valid can be used in here.
Make sure that you are using the same token id's for the rest of the testing period.

Then, we should mint the tokens that we defined
```
leo execute --program simple_token_6.aleo --broadcast mint_public 216163108195field 
leo execute --program simple_token_6.aleo --broadcast mint_public 216163108196field 
```

After minting the tokens, we should allow the test_swap_14.aleo program to spend our tokens. So, we should call the approve_public function from token_registry.

```
leo execute --program token_registry.aleo --broadcast approve_public 216163108195field test_swap_14.aleo 10000u128
```

Now, we initialized the tokens, minted them to our wallet and approve spending for the dex contract. Next step is creating pair for the pair that we minted.
```
leo execute --program test_swap_14.aleo --broadcast create_pair 216163108195field 216163108196field 5000u128 5000u128
```

Having the liquidity means that we are able to swap our tokens now. To swap, we should call the swap_exact_tokens_for_tokens function from test_swap_14.aleo program.
```
leo execute --program test_swap_14.aleo --broadcast swap_exact_tokens_for_tokens 216163108195field 216163108196field 2000u128 5000u128 5000u128 <"Aleo Address">
```

Note that these parameters are provided for the current amount of reserve_a and reserve_b. If you provided other parameters while testing, you should set the reserves accordingly.

Users created the pair. So, we have 2 other main functionality left in this contract. Namely add and remove liquidity.
```
leo execute --program test_swap_14.aleo --broadcast add_liquidity 216163108195field 216163108196field 2000u128 2000u128 5000u128 7000u128 3572u128
```

Note that the last parameter is again, the reserve amount of the token b. It decreased after we swapped some of tokens a for tokens b.

To remove the liquidity, we should call the remove_liquidity function
```
leo execute --program test_swap_14.aleo --broadcast remove_liquidity 216163108195field 216163108196field 1000u128 6428u128 9000u128 4592u128 aleo1pqcumqvf0vjqq800uuyaqqt6s2q6dxcgglywhf6dpzac2cmjgu8q2876eu   
```

Those are the most basic functionalities of a dex with the public states. 