/** @module chat */
"use strict";




export {
  CLI,
  cli,
}


class CLI {
  /**
   * @param {Object?} hw
   */
  constructor(hw = null) {
    this.hw = hw;
  }

  cli_works() {
    console.log("CLI does, indeed, work.");
  }
}



var cli = new CLI(null);
window["cli"] = cli;

