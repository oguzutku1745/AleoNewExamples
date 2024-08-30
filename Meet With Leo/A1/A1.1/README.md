# A1.1
While starting our journey, it's important for us to have you in the ecosystem. You can get updates from [Aleo Twitter](https://x.com/AleoHQ), follow the upcoming events from [Aleo Events](http://t.me/aleoevents) or chat with us and ask questions on [Aleo Discord](http://discord.gg/aleo)!

We know that developer documentation is the most needed resource for any ecosystem, so we maintain our [documentation](https://developer.aleo.org/getting_started/) regularly. Let’s explore it now!

You will find information about [Aleo](https://developer.aleo.org/), [Leo](https://docs.leo-lang.org/leo), [SnarkVM](https://developer.aleo.org/aleo), [Protocol Concepts](https://developer.aleo.org/concepts), [SDK](https://developer.aleo.org/sdk) and [Testnet Beta](https://developer.aleo.org/testnet/getting_started/overview). In this section, we will mostly focus on Aleo and Leo

To get started, you can [install Leo](https://docs.leo-lang.org/leo/installation) depending on your system type. 

The developer docs cover different aspects of each part. Below, you can find a brief overview of what each part covers.

### Hello Leo

The "Hello Leo" section introduces you to the basics of creating and running a Leo project using the Leo Command Line Interface (CLI). You'll learn how to set up a project, understand its structure, and run your first Leo program.

### Language  
The "Language" section provides an overview of Leo's core principles and features. It covers key concepts such as static typing, explicit types, and data structures like booleans, integers, field elements, group elements, and addresses.


**Operators**

The "Operators" section provides an overview of the standard and cryptographic operators available in Leo. These operators are essential for performing arithmetic, logical, and cryptographic operations within your Leo programs.

**Tooling**

The "Tooling" section covers the various tools and plugins available to enhance your Leo development experience. It includes instructions on how to set up syntax highlighting and other editor features for Sublime Text, Visual Studio Code, and IntelliJ.

**Developer Resources**

The "Developer Resources" section points you to key resources that will help you deepen your knowledge and get involved in the Aleo ecosystem. It includes links to workshops, curated lists of resources, and community channels like Discord.

**Leo Syntax Cheatsheet**

The "Leo Syntax Cheatsheet" provides a quick reference for key syntax elements in Leo, including file imports, data types, records, structs, arrays, and functions. It also covers control structures like loops, mappings, and operators, along with commands for managing program logic and assertions. This section is designed to give you a concise overview of the fundamental building blocks of Leo programming.

**Ecosystem Resources**

Even though the developer documentation covers different aspects of Leo development, it's always helpful to see how it works with examples. If you want to check out examples, [Awesome Aleo](https://github.com/howardwu/awesome-aleo) is one of the best GitHub repositories for you!


Curious about SnarkOS and SnarkVM? Check out the [Aleo Network Foundation Github](https://github.com/AleoNet) for source codes and more Aleo-related content.

In Aleo, the Testnet faucets are maintained by ecosystem wallets. Before we move on, we suggest you get some Testnet AC’s from either [Puzzle](https://puzzle.online/) or [Leo](https://www.leo.app/) wallet.
#
Now that we're familiar with the documentation and helpful repositories, it’s time to explore [Leo Playground](https://play.leo-lang.org/)!

Leo Playground helps you code the way you prefer: from the command line or a graphical editor with its user-friendly interface. Let’s explore it now!
The layout is simple: a menu bar at the top, directory structure on the left, a code editor in the center, and the command line at the bottom.


You can check out different pre-built examples such as Token, Vote, Tic Tac Toe, Auction, etc., from the “Examples” menu on the menu bar.
The directory structure helps you build your Leo program flexibly without worrying about how Playground handles this structure under the hood. The “main.leo” file in the src directory is where we will edit our code. 

After we finish our Leo program, we can run it using the “leo run” command, which will create the “main.aleo” file under the build directory. This file contains Leo instructions and is the actual file SnarkVM interacts with in Leo programs. It is updated each time you run your Leo program. To change the account you interact with, the testnet you use, and the endpoint for development, you can edit the “.env” file.
#

It’s time to have fun! Now, let’s try a few commands from Playground’s command line!

- ${\textsf{\color{green}leo run}}$: This runs your Leo program and creates the Aleo instructions.

- ${\textsf{\color{green}leo account new}}$: This creates a new Aleo account with a Private key and View key.

- ${\textsf{\color{green}leo deploy}}$: This creates a new Aleo account with a Private key and View key. Deploys your program to the network.

Hands-On!

The leo run command expects the transition name and inputs:

`
leo run <transition name> <inputs>
`

Let’s run your Hello World program in Playground with - ${\textsf{\color{green}leo run main 1u32 2u32}}$

Change your transition’s name and try it again with different inputs!


