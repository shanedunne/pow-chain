const {utxos} = require('../db')


class Transaction {
    constructor(inputs, outputs) {
        this.inputs = inputs;
        this.outputs = outputs;
    }

    execute() {
        this.inputs.forEach((input) => {
            input.spent = true;
        });
        // added Array.from as forEach consoling not as a function
        Array.from(this.outputs).forEach((output) => {
            utxos.push(output);
        });
    }
}

module.exports = Transaction;