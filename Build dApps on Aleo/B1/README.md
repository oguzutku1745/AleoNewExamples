# B1

The Aleo SDK equips developers with a robust set of tools specifically designed for building zero-knowledge applications, using a variety of TypeScript and JavaScript libraries. 


These libraries support essential tasks such as Aleo account management, web-based program execution, and the transfer of Aleo credits, while also handling the management of program state and data. All of this functionality is demonstrated on provable.tools.


The SDK is structured into key packages, including the [Aleo SDK](https://developer.aleo.org/sdk/typescript/overview) for developing web apps, [Create-leo-App](https://github.com/ProvableHQ/sdk/tree/testnet3/create-leo-app) for zero-knowledge web app examples, and [Aleo-Wasm](https://developer.aleo.org/sdk/wasm/installation) for incorporating zero-knowledge algorithms into JavaScript and WebAssembly projects, and the [Aleo Python SDK](https://github.com/AleoHQ/python-sdk) for creating zero-knowledge apps in Python, featuring the Aleo and zkml libraries. 


This collection of tools and documentation is thoughtfully crafted to guide developers through the creation, deployment, and management of zero-knowledge applications with ease and precision.

##
To install the Aleo SDK from NPM run:

`npm install @provablehq/sdk` or `yarn add @provablehq/sdk`


After we install the Aleo SDK, we should have an account as the first step to use SDK’s full capability. From SDK, we can create ${\textsf{\color{green}Private Key}}$, ${\textsf{\color{green}View Key}}$ and an ${\textsf{\color{green}Account}}$:

```leo
import { Account } from '@provablehq/sdk';

const account = new Account();

// Individual keys can then be accessed through the following methods
const privateKey = account.privateKey();
const viewKey = account.viewKey();
const address = account.address();
```
⚠️ ${\textsf{\color{red}Note that the private key and the view key are considered sensitive information and should be stored securely.}}$:

Once we derived our account, we can move to executing Aleo programs. We mentioned about the relation between the Leo Language and Aleo instructions on [previous sections](../../Meet%20With%20Leo).
Leo Language takes the complexity away of Aleo Instructions while building dApps. Check the example below of simple Hello World program:


**Hello World in Leo**
```leo
// A simple program adding two numbers together
program helloworld.aleo {
  transition hello(public a: u32, b: u32) -> u32 {
      let c: u32 = a + b;
      return c;
  }
}
```
**Hello World in Aleo Instructions**
```leo
program helloworld.aleo;


// The Leo code above compiles to the following Aleo Instructions:
function hello:
    input r0 as u32.public;
    input r1 as u32.private;
    add r0 r1 into r2;
    output r2 as u32.private;
```


*The Aleo SDK provides the ability to execute Aleo programs 100% client-side within the browser.*


The basic execution flow of a program is as follows:

- A web app is loaded with an instance of the ProgramManager object.
```javascript
import {ProgramManager} from "@provablehq/sdk";


const programManager = new ProgramManager();
```

- The SDK wasm modules are loaded into the browser's WebAssembly runtime.

- An Aleo program in Aleo Instructions format is loaded into the ProgramManager as a wasm object.

- The web app provides a user input form for the program.
- The user submits the inputs and the zero-knowledge execution is performed entirely within the browser via WebAssembly.
- The result is returned to the user.
- A fully encrypted zero-knowledge transcript of the execution is ${\textsf{\color{green}optionally}}$ sent to the Aleo network.

A diagramatic representation of the program execution flow is shown below:


graph LR
    p1[Leo Program]
    p2[Aleo Instructions]


    subgraph Browser Web-App
        subgraph ProgramManager
            subgraph Aleo-Wasm-Module
                in-memory-program
            end
        end
    end


    p1-->p2--load program--oin-memory-program-.ZK result.->user
    user-.user input.->in-memory-program
    in-memory-program-."ZK result (Optional)".->Aleo-Network


#


Multithreading allows a program to execute multiple tasks simultaneously, improving efficiency and performance. In the Aleo SDK, you can enable multithreading by calling the `initThreadPool` function, which runs the SDK on multiple workers to significantly speed up operations.


```leo
import { Account, initThreadPool } from '@provablehq/sdk';


// Enables multithreading
await initThreadPool();


// Create a new Aleo account
const account = new Account();


// Perform further program logic...
```


After we created our account, we should provide it to execute functions locally. For this purpose, we will use ProgramManager instance’s `run` function. Below is a simple example of running the *hello world* program locally using Node.js and capturing its outputs is shown below.

```javascript
import helloworld_program from "../token/build/main.aleo?raw"; //Import build file
import { Account, ProgramManager } from '@provablehq/sdk';
const programManager = new ProgramManager();


/// Create a temporary account for the execution of the program
const account = new Account();
programManager.setAccount(account);


/// Get the response and ensure that the program executed correctly
const executionResponse = await programManager.run(program, "hello", ["5u32", "5u32"]);
const result = executionResponse.getOutputs();
assert.deepStrictEqual(result, ['10u32']);
```

⚠️ If you are building your dApp on Aleo without using create leo-app, adding configuration rules in your build system (like Vite, Webpack, or Next.js) is necessary to tell the build tool how to process these files. Using something like raw-loader in this configuration ensures that `.aleo` files are loaded as plain text. This step is essential because it converts the content of .aleo files into a usable format that your web application can execute or display.

To webpack config file:
``` 
module:{
 rules:[
         {
       test: /\.aleo$/i,
       use: 'raw-loader',
     },
 ]
}
```

It is also possible to bypass this step by directly defining the program as string:

```
const program = "program hello_hello.aleo;\n\nfunction hello:\n    input r0 as u32.public;\n    input r1 as u32.private;\n    add r0 r1 into r2;\n    output r2 as u32.private;\n";


// Define a fee to pay to deploy the program
const fee = 3.8; // 3.8 Aleo credits


// Deploy the program to the Aleo network
const tx_id = await programManager.deploy(program, fee);


// Verify the transaction was successful
const transaction = await programManager.networkClient.getTransaction(tx_id);
```

`

<details><summary>Handling .aleo Types in TypeScript</summary>
    
If you are using TypeScript, you need to inform the TypeScript compiler about the type of content these files contain by declaring a module for *.aleo files:
`config.d.ts``
```
declare module '*.aleo' {
  const content: string;
  export default content;
}
```
Make sure that you included custom types in your tsconfig file.

   </details>


The SDK also provides the ability to execute programs and record an encrypted transcript of the execution on the Aleo network that anyone can trustlessly verify.

This process can be thought of being executed in three steps:

1. A program is run locally

2. A proof that the program was executed correctly and that the outputs follow from the inputs is generated
3. A transcript of the proof is generated client-side containing encrypted proof data and any public outputs or state the user of the program wishes to reveal

4. The proof transcript is posted to the Aleo network and verified by the Aleo validator nodes in a trustless manner
5. If the proof is valid, it is stored and anyone can later verify the proof and read the outputs the author of the program has chosen to make public. Private inputs will remain encrypted, but the author of the proof can also choose to retrieve this encrypted state at any point and decrypt it locally for their own use.

This process of posting the execution to the Aleo Network serves as a globally trustless and verifiable record of program execution. It also provides a global record of any state changes made to either records or data stored on the Aleo network.

A simple example of running the hello world program on the Aleo network is shown below:
```javascript
import { Account, AleoNetworkClient, NetworkRecordProvider, ProgramManager, KeySearchParams} from '@aleohq/sdk';


// Create a key provider that will be used to find public proving & verifying keys for Aleo programs
const keyProvider = new AleoKeyProvider();
keyProvider.useCache = true;


// Define an account which will execute the transaction on-chain
const account = new Account({ privateKey: private_key });
const privateKeyObject = PrivateKey.from_string(private_key);


// Create a record provider that will be used to find records and transaction data for Aleo programs
const networkClient = new AleoNetworkClient("https://api.explorer.aleo.org/v1");
const recordProvider = new NetworkRecordProvider(account, networkClient);


// Initialize a program manager to talk to the Aleo network with the configured key and record providers
const programName = "hello_hello.aleo";
const programManager = new ProgramManager("https://api.explorer.aleo.org/v1", keyProvider, recordProvider);
programManager.setHost("https://api.explorer.aleo.org/v1")
programManager.setAccount(account);


// For example: "cacheKey": "hello_hello:hello"
const cacheKey = `${programId}:${aleoFunction}`;
const keySearchParams = new AleoKeyProviderParams({ "cacheKey": cacheKey });


// Execute the program function
const executionResponse = await programManager.execute(
       programId,
       aleoFunction,
       fee,
       false,
       inputs,
       undefined,
       keyParams,
       undefined,
       undefined,
       undefined,
       privateKeyObject
   );


const transaction = await programManager.networkClient.getTransaction(executionResponse);
````

A reader of the above example may notice the ${\textsf{\color{green}RecordProvider}}$ and ${\textsf{\color{green}KeyProvider}}$ classes that were not present in the local execution example. 

The KeyProvider class helps users of the SDK find Proving Keys for programs. Proving Keys allow zero knowledge proofs that the programs were executed correctly to be created. 

The RecordProvider class helps find Records which are private data associated with programs that can be changed and updated throughout time.

Until now, we learned how to execute programs both on-chain and in local. Lastly, we will learn how to deploy a program to Aleo network.

Any user can add an Aleo program to the network (as long as it doesn't already currently exist) by paying a deployment fee in Aleo credits. The SDK provides a simple interface for deploying programs to the Aleo network using the program manager.

```javascript
import helloworld_program from "../token/build/main.aleo?raw"; //Import build file
import { Account, AleoNetworkClient, NetworkRecordProvider, ProgramManager, KeySearchParams} from '@aleohq/sdk';


// Create a key provider that will be used to find public proving & verifying keys for Aleo programs
const keyProvider = new AleoKeyProvider();
keyProvider.useCache = true;


// Create a record provider that will be used to find records and transaction data for Aleo programs
const networkClient = new AleoNetworkClient("https://api.explorer.aleo.org/v1");
const recordProvider = new NetworkRecordProvider(account, networkClient);


// Initialize a program manager to talk to the Aleo network with the configured key and record providers
const programManager = new ProgramManager("https://api.explorer.aleo.org/v1", keyProvider, recordProvider);


// Define an Aleo program to deploy


// Define a fee to pay to deploy the program
const fee = 1.8; // 1.8 Aleo credits


// Deploy the program to the Aleo network
const tx_id = await programManager.deploy(program, fee);


// Verify the transaction was successful
const transaction = await programManager.networkClient.getTransaction(tx_id);
```

#

The API Reference provides comprehensive documentation and tutorials for the Aleo SDK, offering detailed guidance on building Leo and Aleo Instructions programs.


**Query The Network**​

The Aleo Testnet API is organized around REST.
To connect to the network, make a request to an Aleo Testnet bootnode.

URL
https://api.explorer.aleo.org/v1/testnet


The detailed API Reference can be found [here](https://developer.aleo.org/testnet/getting_started/overview#api). We will cover some of the essential functions here to demonstrate their usage.


**Latest Height**

`GET /testnet/latest/height`

Returns the latest block height.

**Get Transaction**

`GET /testnet/transaction/{transactionID}`

Returns the transaction for the given transaction ID.

**Get Mapping Value**

`GET /testnet/program/{programID}/mapping/{mappingName}/{mappingKey}`

Returns the value in a key-value mapping corresponding to the supplied mappingKey.


**Find Transaction ID From Transition ID**

`GET /testnet/find/transactionID/{transitionID}``

Returns the transaction ID of the transaction containing the given transition ID.


### Build Together!


The guide becomes interactive after this section. Please follow the structure outlined here on your own to fully understand the content, and feel free to ask any questions on [Aleo Discord](discord.gg/aleo) if you encounter any difficulties!


The above concepts can be tied together in a concrete example of a single-page web app. This example can be installed in one step by running:


`npm create leo-app@latest`


After creating our app, we will remove the bodies of following functions and we will later fill them in worker.js (or worker.ts if you are using Typescript):
-	localProgramExecution
-	deployProgram


First, we will focus to localProgramExecution. This function takes 3 arguments. First one is the Aleo Program. We can either import it; or we can provide the plain string version of Aleo Instructions. Next is the name of our transition in our Aleo Program. Last one is the inputs as an array.


`async function localProgramExecution(program, aleoFunction, inputs)`


Next, we should define the `ProgramManager` to interact with Aleo programs:

 ```javascript
 const programManager = new ProgramManager();
````

To interact with Aleo programs, we need an Aleo account. We will create a temporary Aleo account and provide it to ProgramManager:
```javascript
 const account = new Account();
 programManager.setAccount(account);
```

To execute our program locally, we will use the run function of the ProgramManager object
```javascript
const executionResponse = await programManager.run(
  program,
  aleoFunction,
  inputs,
  false,
);
```

Finally, we will return our outputs:

```javascript
 return executionResponse.getOutputs();
```

After we handle these functions, we can go ahead and test whether our function is correct or not by running `npm run dev` from our console.


If everything works as expected; next up is deploying our program by Aleo SDK!

Create a key provider that will be used to find public proving & verifying keys for Aleo programs

```javascript
 const keyProvider = new AleoKeyProvider();
 keyProvider.useCache(true);
```

Next, we need a record provider that will be used to find records and transaction data for Aleo programs.

```javascript
 const networkClient = new AleoNetworkClient("https://api.explorer.aleo.org/v1");
 ```

To deploy a program to the network, we need to pay the deployment fee. So, we need to provide an account with funds. If you haven’t already use faucet, please check section [A1.1](../../Meet%20With%20Leo/A1/A1.1).

Change the *user1PrivateKey* with your private key.

```javascript
 const account = new Account({
   privateKey: "user1PrivateKey",
 });
```

⚠️ ${\textsf{\color{red}Don't forget to remove your private key if you push this to a public platform such as GitHub.}}$

After defining our account, we will define the RecordProvider with the account and networkClient that we previously defined.

```javascript
 const recordProvider = new NetworkRecordProvider(account, networkClient);
```

The ProgramManager takes 3 arguments while interacting with the network, namely `endpoint`, `recordProvider`, and `keyProvider`. Since we have defined recordProvider and keyProvider, it is now time to define our ProgramManager:

```javascript
 const programManager = new ProgramManager(
   "https://api.explorer.aleo.org/v1",
   keyProvider,
   recordProvider,
 );
```

Set our account with funds

```javascript
 programManager.setAccount(account);
```

Define the fee and call the `deploy` function

```javascript
 // Define a fee to pay to deploy the program
 const fee = 1.9; // 1.9 Aleo credits


 // Deploy the program to the Aleo network
 const tx_id = await programManager.deploy(program, fee);
```

Hint

<details><summary>Providing Private Fee</summary>
    
 // Optional: Pass in fee record manually to avoid long scan times

 // const feeRecord = "{  owner: aleo1xxx...xxx.private,  microcredits: 2000000u64.private,  _nonce: 123...789group.public}";

 // const tx_id = await programManager.deploy(program, fee, undefined, feeRecord);
   </details>

Finally, return the tx_id

```javascript
 return tx_id;
```

#


That’s all! We’re ready for the Hands-on exercise!


### Hands-On!
In the previous example, we learned how to build our custom token 🪙


Now, let's try to build a dApp that interacts with our previously deployed token program and calls the `mint_public` and `mint_private` transitions locally.


<details><summary> Hint</summary>
    
    -    Use npm create leo-app@latest
    -    Create your program in the helloworld directory
    -    Modify the localProgramExecution function in App.jsx to adjust it according to your program.
    -    Duplicate the local execution button for the mint_public and mint_private transitions.


For Bonus:
    -    Add an on-chain execution function that uses “execute” instead of “run” in worker.js.
    -    Add a button to the frontend to interact with the function in worker.js with the correct parameters.
    -    Don’t forget to handle the useState hooks for proper state management.    
</details>


*Bonus*
You can also try to add an on-chain execution function for the mint_public transition in our token program.


Congratulations! You built your first dApp on Aleo!


If you have any questions, don't hesitate to visit [Aleo Discord](https://discord.gg/aleo).


The built example can be found [here](https://github.com/AleoNet/workshop/blob/master/token/src/main.leo).


