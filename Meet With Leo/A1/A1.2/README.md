# A1.2

While building on Aleo, it is important to follow the naming conventions. The name of the file that we are developing with Leo should end with `.leo` extension. On the other side, you will see a file with `.aleo` extension in build directory, which is the instructions of our Leo program like we mentioned in [previous part](../A1.1).

To name our program, we will go to main.leo file and choose the name of our program. The program name must start with a small letter. Below is the list of invalid program names and a valid version. 
```leo
program hello.aleo; // valid

program Foo.aleo;   // invalid
program baR.aleo;   // invalid
program 0foo.aleo;  // invalid
program 0_foo.aleo; // invalid
program _foo.aleo;  // invalid
```

While importing programs, we are referencing the name of the program, so we should reference to the {name}.aleo

```
import foo.aleo; // Import all `foo.aleo` declarations into the `hello.aleo` program.

program hello.aleo { }
```
#
After naming our program, its time to fill the body of our program.

- In Leo, every variable's type must be known before the program runs, ensuring type-related errors are caught early. This makes Leo a ${\textsf{\color{green}statically typed}}$ language. 

- All variables in Leo must be ${\textsf{\color{green}explicitly typed}}$; there’s no room for undefined or null values.

- When variables are used in functions or assignments, Leo ${\textsf{\color{green}passes their values}}$ instead of referencing them, preventing unintended modifications. 

Below is the basic data types and variable definitions in Leo

**Booleans**

Leo requires booleans (true or false) to be explicitly typed as bool.

`let b: bool = false;`


**Integers**

Leo supports various integer types (e.g., u8, i32). The integer type must always be explicitly stated.

`let b: u8 = 1u8;`

**Field Elements**

Field elements are unsigned integers less than the modulus of the elliptic curve’s base field, used for cryptographic operations.

`let a: field = 0field;`

**Group Elements**

Group elements represent points on an elliptic curve, used in cryptography, and are denoted by the group type.

`let a: group = 0group;`

**Scalars**

Scalars are smaller than field elements and are used in elliptic curve operations, defined with the scalar type.

`let a: scalar = 0scalar;``

**Addresses**

Addresses in Leo are special types for referencing accounts or locations on the network, optimized for specific operations.

`let receiver: address = aleo1ezamst4pjgj9zfxqq0fwfj8a4cjuqndmasgata3hggzqygggnyfq6kmyd4;`

**Signatures**

Leo uses the Schnorr signature scheme, with signatures declared as signature and verified using built-in functions.
### Layout of a Leo Program
A Leo program contains declarations of a *Program, Constants, Imports , Transition Functions, Async Functions, Helper Functions, Structs , Records*, and *Mappings*. Below, you can find their explanations and small examples for them.

**Program**

A Leo program is the main structure that houses all the code and data, identified by a `program ID` on the Aleo blockchain.

```leo
program hello.aleo {
    // Your program code goes here
}
```

**Constant**

Constants are immutable values that must be initialized when declared. They can be used throughout the program but cannot be changed.

```leo
program example.aleo {
    const MAX_SUPPLY: u64 = 1_000_000u64;
    
    function get_max_supply() -> u64 {
        return MAX_SUPPLY;
    }
}
```

**Struct**

Structs are also present in Aleo like few other popular languages. They are the custom data types that group related variables under one name. 

```leo
struct User {
    name: string,
    age: u32,
    balance: u64,
}
```

**Record**

Records are one of the most important declarations in Aleo, helping to preserve privacy. It is not wrong to think of the record model as similar to the UTXO model, where you store UTXOs instead of just updating the public state as in the account model. You can also check out this video about records (link to video). Records are similar to structs but include visibility modifiers and must contain an owner component.

```leo
record Token {
    owner: address,
    amount: u64,
}
```

**Transition Function**

Transition functions are the primary way to execute logic within a Leo program. They can directly alter the program's state. You can call a transition function directly using the “leo run” command, as we did at the end of the previous section.
Transition functions that call async functions to execute code on-chain and update a public state must be declared as async transition.

```leo
program hello.aleo {
    transition foo(
        public a: field,
        b: field,
    ) -> field {
        return a + b;
    }
}
```

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

Before moving on, it's important to understand the ${\textsf{\color{red}Record Model}}$. Please watch [this video]() to learn how private states are handled in the Aleo Network.
###

Leo provides several control structures to manage the flow of your program, including if statements, return statements, and for loops:

**If Statements**

   If statements allow you to execute code based on a condition. They are structured as `if {condition} { ... } else if {condition} { ... } else { ... }`. You can nest if statements for more complex logic.

⚠️ `When writing on-chain code in Leo, there are specific restrictions to keep in mind. For example, you *cannot* reassign a variable that was declared outside of the conditional block. Instead, you need to explicitly handle each branch of the condition or use a ternary operator.`

The following code will result in a compiler error:

```leo
let x: u8 = 1u8;
if (condition) {
    x = x + y;
} else {
    x = x + z;
}```
data.set(0u8, x);


Example without reassignment:
   ```leo
   let x: u8 = 1u8;
   if (condition) {
       let x_new: u8 = x + y;
       data.set(0u8, x_new);
   } else {
       let x_new: u8 = x + z;
       data.set(0u8, x_new);
   }
   ```

**Return Statements**

   Return statements are used to exit a function and return a value. They are written as `return {expression};`.

   ```leo
   let a: u8 = 1u8;

   if a == 1u8 {
       return a + 1u8;
   } else if a == 2u8 {
       return a + 2u8;
   } else {
       return a + 3u8;
   }
   ```

**For Loops**

   For loops are used to iterate over a range of values. They are declared as `for {variable: type} in {lower bound}..{upper bound}`, where the bounds must be constant integers of the same type.

   ```leo
   let count: u32 = 0u32;

   for i: u32 in 0u32..5u32 {
       count += 1u32;
   }

   return count; // returns 5u32
   ```

### Context-Dependent Expressions in Leo

Leo supports a variety of context-dependent expressions that allow you to reference information about the Aleo blockchain and the current transaction within your program. These expressions are useful for interacting with on-chain data and handling conditions based on blockchain state.

**self.caller**

The `self.caller` expression returns the address of the account or program that invoked the current transition. This is particularly useful when you need to verify or log the initiator of a function.

   ```leo
   program test.aleo {
       transition matches(addr: address) -> bool {
           return self.caller == addr;
       }
   }
   ```

**self.signer**

   The `self.signer` expression returns the address of the account that signed the transaction. This is the account that initiated the top-level transition, and it can be used to enforce rules based on the transaction origin.

   ```leo
   program test.aleo {
       transition matches(addr: address) -> bool {
           return self.signer == addr;
       }
   }
   ```

**block.height**

The `block.height` expression returns the current block's height on the Aleo blockchain. This can be used to make decisions based on the blockchain's progression, such as timing certain actions. 

⚠️ ${\textsf{\color{red}block.height can only be used within an async function.}}$

   ```leo
   program test.aleo {
       async transition matches(height: u32) -> Future {
           return check_block_height(height);
       } 
       
       async function check_block_height(height: u32) {
           assert_eq(height, block.height);
       }
   }
   ```
#
One other important part is the *core functions*. The functions that are built into the Leo language. 

They are used to check assertions and perform cryptographic operations such as hashing, commitment, and random number generation. 

**Assert**

assert and assert_eq are used to verify that a condition is true. If the condition is false, the program will fail.

```leo
program test.aleo {
    transition matches() {
        assert(true);
        assert_eq(1u8, 1u8);
    }
}
```

>The assert statements are simple yet effective statements which can be used in a combination with context-dependent expressions to verify the block height, ownership etc. 

**Hash**
​

Leo supports the following hashing algorithms: `BHP256`, `BHP512`, `BHP768`, `BHP1024`, `Pedersen64`, `Pedersen128`, `Poseidon2`, `Poseidon4`, `Poseidon8`, `Keccak256`, `Keccak384`, `Keccak512`, `SHA3_256`, `SHA3_384`, `SHA3_512`.

The output type of a hash function is specified in the function name. e.g. `hash_to_group` will return a ${\textsf{\color{green}group}}$ type.  

Hash functions take any type as an argument.
```leo
let a: scalar = BHP256::hash_to_scalar(1u8);
let b: address = Pedersen64::hash_to_address(1u128);
let c: group = Poseidon2::hash_to_group(1field);
```

**Commit**

Leo supports the following commitment algorithms: BHP256, BHP512, BHP768, BHP1024, Pedersen64, Pedersen128

**Random**

Leo supports the ChaCha random number generation algorithm. 

⚠️ ${\textsf{\color{red}Random functions are only allowed in an async function.}}$

```leo
let a: group = ChaCha::rand_group();
let b: u32 = ChaCha::rand_u32();
```

