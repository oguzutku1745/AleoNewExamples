program buy_coffee.aleo {

    record money {
        // The money owner.
        owner: address,
        // The money amount.
        amount: u64,
    }

    /* Mint */
    // The function `create_money` initializes a new record with the specified amount of money for the receiver.
    transition create_money(receiver: address, amount: u64) -> money {
        return money {
            owner: receiver,
            amount: amount,
        };
    }

    // The function `buy_coffee` sends the specified money amount to the money receiver from the specified money record to buy a coffee.
    transition buy_coffee(sender: money, receiver: address) -> (money, money) {

        // Predefined coffee price
        let coffee_price: u64 = 5u64;

        // Checks the given money record has sufficient amount to buy coffee.
        // This `sub` operation is safe, and the proof will fail if an overflow occurs.
        // `change` holds the change amount to be returned to sender.
        let change: u64 = sender.amount - coffee_price;

        // Produce a money record with the change amount for the sender.
        let remaining: money = money {
            owner: sender.owner,
            amount: change,
        };

        // Produce a money record for the specified receiver.
        let transferred: money = money {
            owner: receiver,
            amount: amount,
        };

        // Output the sender's change record and the receiver's record.
        return (remaining, transferred);
    }

    // The function combines the previously produced records
    transition combine_money(first_money_record:money, second_money_record:money) -> money {
        // Store the total amount of different records
        let total_amount:u64 = first_money_record.amount + second_money_record.amount;

        // Store the owner of the records
        // We can move without using assert statement since the records can not be spent by anyone else except their owner.
        let money_owner:address = first_money_record.owner;

        // Create and return the combined money record
        return money{
            owner: money_owner,
            amount: total_amount
        };
    }

    // The function splits the money record into two money records
    transition split_money(money_record:money, split_amount:u64) -> (money,money) {
        
        // Create the splitted record
        let money_splitted: money = money {
            owner: money_record.owner,
            amount: split_amount,
        };

        // Define the remaining amount from the money record after subtracting split amount
        let remaining_amount: u64 = money_record.amount - split_amount;

        // Create the record for remaining amount
        let money_remaining: money = money {
            owner: money_record.owner,
            amount: remaining_amount
        };

        // Return newly created records
        return(money_splitted, money_remaining);
    }

}