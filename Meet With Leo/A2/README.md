**Async Function**

The async function is a declaration that updates public states on the Aleo network based on the given parameters. This type of function must be called by an async transition, which returns a Future object. Calculations can be made within the async transition block, but any on-chain public state changes should be handled within the async function block.


```leo
program transfer.aleo {
    // The function `transfer_public_to_private` turns a specified token amount
    // from `account` into a token record for the specified receiver.
    //
    // This function preserves privacy for the receiver's record, however
    // it publicly reveals the sender and the specified token amount.
    async transition transfer_public_to_private(
        receiver: address,
        public amount: u64
    ) -> (token, Future) {
        // Produce a token record for the token receiver.
        let new: token = token {
            owner: receiver,
            amount,
        };

        // Return the receiver's record, then decrement the token amount of the caller publicly.
        return (new, update_public_state(self.caller, amount));
    }

    async function update_public_state(
        public sender: address,
        public amount: u64
    ) {
        // Decrements `account[sender]` by `amount`.
        // If `account[sender]` does not exist, it will be created.
        // If `account[sender] - amount` underflows, `transfer_public_to_private` is reverted.
        let current_amount: u64 = Mapping::get_or_use(account, sender, 0u64);
        Mapping::set(account, sender, current_amount - amount);
    }
}
```

**Mappings**

Mappings are public key-value stores on the blockchain that allow you to store, retrieve, and manipulate data. Since they manipulate the public data, they are only allowed in an async function.

```leo
    // Declare a mapping that associates an address with a balance
    mapping balances: address => u64;
```

**Mapping Operations**

Mappings can be read from and modified by calling one of the following functions.

`get`

A get command, e.g. current_value = Mapping::get(counter, addr); Gets the value stored at addr in counter and stores the result in current_value If the value at addr does not exist, then the program will fail to execute.

`get_or_use`

A get command that uses the provided default if the key is not present in the mapping,
e.g. let current_value: u64 = Mapping::get_or_use(counter, addr, 0u64);
Gets the value stored at addr in counter and stores the result in current_value. If the key is not present, 0u64 is stored in counter (associated to the key) and in current_value.

`set`

A set command, e.g. Mapping::set(counter, addr, current_value + 1u64); Sets the addr entry as current_value + 1u64 in counter.

`contains`

A contains command, e.g. let contains: bool = Mapping::contains(counter, addr); Returns true if addr is present in counter, false otherwise.

`remove`

A remove command, e.g. Mapping::remove(counter, addr); Removes the entry at addr in counter

Below is the example usage of Mapping operations
```leo
program test.aleo {
    mapping counter: address => u64;

    async transition dubble() -> Future {
        return update_mappings(self.caller);
    }

    async function update_mappings(addr: address) {
        let current_value: u64 = Mapping::get_or_use(counter, addr, 0u64);
        Mapping::set(counter, addr, current_value + 1u64);
        current_value = Mapping::get(counter, addr);
        Mapping::set(counter, addr, current_value + 1u64);
    }

}
```
