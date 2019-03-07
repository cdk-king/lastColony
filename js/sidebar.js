var sidebar = {
    animate:function(){
        //显示当前资金数目
        this.cash = document.getElementById("cash");
        // Display the current cash balance value
        this.updateCash(game.cash[game.team]);
    },
    // Cache the value to avoid unnecessary DOM updates
    _cash: undefined,
    updateCash: function(cash) {
        // Only update the DOM value if it is different from cached value
        if (this._cash !== cash) {
            this._cash = cash;
            // Display the cash amount with commas
            this.cash.innerHTML = cash.toLocaleString();
        }
    },
}