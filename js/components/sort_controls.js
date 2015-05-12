var SortControls = (function() {

    function sortControls() {

        this.defaultAttrs({
            sortByLinksSelector: "a",
            selectedClass: 'selected'
        });

        this.markSelected = function(el) {
            $(el).addClass(this.attr.selectedClass)
                 .siblings("a")
                 .removeClass(this.attr.selectedClass);
        };

        this.isSelected = function(el) {
            return $(el).hasClass(this.attr.selectedClass);
        };

        this.sortBy = function(ev, data) {
            data.alreadySelected = this.isSelected(data.el);
            this.trigger(document, "uiSortBy", data);
            this.markSelected(data.el);
        };

        this.after('initialize', function() {
            this.on('click', {
                'sortByLinksSelector': this.sortBy
            });
        });
    }

    return flight.component(sortControls);

})();
