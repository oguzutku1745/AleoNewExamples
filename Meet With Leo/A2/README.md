
# A2

In the [previous section](../A1/A1.2), we covered how Aleo handles private transactions for buying coffee. In this part, we will focus on the public states of Aleo and how to enable both private and public states within the same program.
#

Mappings are commonly used declarations in blockchain programs (or contracts) that contain key-value pairs. In Aleo, mappings are stored on-chain and are publicly visible.

**Mappings**

Mappings are public key-value stores on the blockchain that allow you to store, retrieve, and manipulate data. 

⚠️ ${\textsf{\color{red}Since they manipulate the public data, they are only allowed in an async function}}$

```leo
   // Declare a mapping that associates an address with a balance
    mapping balances: address => u64;
```

**Mapping Operations**

Mappings can be read from and modified by calling one of the following functions.

`get`

A get command, e.g. `current_value = Mapping::get(counter, addr); `Gets the value stored at addr in counter and stores the result in `current_value`. If the value at addr does not exist, then the program will fail to execute.

`get_or_use`

A get command that uses the provided default if the key is not present in the mapping, e.g. `let current_value: u64 = Mapping::get_or_use(counter, addr, 0u64);`

 Gets the value stored at addr in counter and stores the result in `current_value`. If the key is not present, `0u64` is stored in counter (associated to the key) and in `current_value`.


`set`
A set command, e.g. `Mapping::set(counter, addr, current_value + 1u64);` Sets the addr entry as `current_value + 1u64` in `counter`.


`contains`

A contains command, e.g. `let contains: bool = Mapping::contains(counter, addr);` Returns true if addr is present in `counter`, false otherwise.

`remove`

A remove command, e.g. `Mapping::remove(counter, addr);` Removes the entry at addr in `counter`

Below is the example usage of Mapping operations
```
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

When you check the example above, you will realize that we used mappings in an ${\textsf{\color{green}async function}}$ block. The reason for this is that public state updates must be handled in async function blocks. 

In the previous section, we used transitions to handle records; now, we will use async transitions to handle on-chain computations and call the async function block to handle public state changes.

**Async Function**

The async function is a declaration that updates public states on the Aleo network based on the given parameters. This type of function must be called by an async transition, which returns a ${\textsf{\color{green}Future}}$ object. Calculations can be made within the ${\textsf{\color{green}async transition}}$ block, but any on-chain public state changes should be handled within the async function block.

```
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

*Leo v2* allows users to read all mappings defined in programs that have been imported with. Just as with reading local mappings, ${\textsf{\color{red}this operation must take place in an async function}}$

```leo
let val:u32 = Mapping::get(token.aleo/account, 0u32);
let val_2:u32 = Mapping::get_or_use(token.aleo/account, 0u32, 0u32);
```
#
One can use `leo add/remove` to import already-deployed network programs or programs from local projects as dependencies.
```leo
// Pull credits.aleo as a dependency
leo add -n credits

// Add a local dependency named foo.aleo whose leo project path is ../foo
leo add -l ../foo foo

// Attach dependencies inside the Leo file
import credits.aleo
import foo.aleo
```

Users may want to assign a unique identifier to an object as a crucial part of their algorithm. To achieve this, we can use the hash functions. Below is the example from [vote workshop](https://github.com/AleoNet/workshop/blob/master/vote/src/main.leo).  

First, we defined a record `Proposal` to assign an id later with the type `field`.
```leo
   record Proposal {
       owner: address,
       id: field,
       info: ProposalInfo,
   }

```
Then, we can assign a unique identifier to Proposal from our transition:

```leo
   async transition propose(public info: ProposalInfo) -> (Proposal, Future) {
       // Authenticate proposer.
       assert_eq(self.caller, info.proposer);


       // Generate a new proposal id.
       let id: field = BHP256::hash_to_field(info.title);




       // Return a new record for the proposal.
       // Finalize the proposal id.
       return (Proposal { owner: self.caller, id, info }, finalize_propose(id));
   }
```

`hash_to_field` function is used to generate a new proposal id. This function returns a hash with type ${\textsf{\color{green}field}}$.

### Hands-On!
In the previous example, we learned how to buy coffee privately.

Now, let's try to build a Leo program to create our own custom token 🪙

With this token, we should be able to mint new tokens and transfer them *both publicly and privately*. After building your custom token, you will have learned how to manage public and private states on Aleo!


<details><summary> Hint</summary>
    
    -    Define a record type "token"
    -    Define a transition to mint private tokens
    -    Define a transition to mint public tokens
    -    Define a transition to transfer private tokens    
    -    Define a transition to transfer public tokens
    -    Define two transitions to handle transfers from private to public; and from public to private   
    
</details>


If you have any questions, don't hesitate to visit [Aleo Discord](https://discord.gg/aleo)

The built example can be found [here](https://github.com/AleoNet/workshop/blob/master/token/src/main.leo).
