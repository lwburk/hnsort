function withPageActions() {

    this.showPageAction = function() {
        chrome.runtime.sendMessage({type:'showPageAction'});
    };

    this.after('initialize', function() {
        this.showPageAction();
    });
}
