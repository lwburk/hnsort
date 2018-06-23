var SortControls = (function() {

    function sortControls() {

        this.attributes({
            sortByLinksSelector: "a",
            selectedClass: "selected",
            reversedClass: "reversed"
        });

        this.markSelected = function(el) {
            this.markReversed(el);
            $(el).addClass(this.attr.selectedClass)
                 .siblings("a")
                 .removeClass(this.attr.selectedClass)
                 .removeClass(this.attr.reversedClass);
        };

        this.markReversed = function(el) {
            var $el = $(el);
            if ($el.hasClass(this.attr.selectedClass)) {
                $el.toggleClass(this.attr.reversedClass);
            }
        };

        this.isSelected = function(el) {
            return $(el).hasClass(this.attr.selectedClass);
        };

        this.sortBy = function(ev, data) {
            data.alreadySelected = this.isSelected(data.el);
            this.trigger(document, "uiSortBy", data);
            this.markSelected(data.el);
        };

        this.linkByKey = function(key) {
            return this.select("sortByLinksSelector").filter(function(i, el) {
                return $(el).data("key") === key;
            }).first();
        };

        this.saveSelected = function(el) {
            var $el = $(el);
            this.set({
                "sort_reversed": $el.hasClass(this.attr.reversedClass),
                "sorted_by": $el.data("key")
            });
        };

        this.applySavedSort = function(items) {
            var link = this.linkByKey(items.sorted_by);
            if (items.sorted_by !== "rank") {
                this.sortBy({}, { "el": link });
            }
            if (items.sort_reversed) {
                this.sortBy({}, { "el": link });
            }
        };

        this.after('initialize', function() {
            this.on('click', {
                'sortByLinksSelector': function(ev, data) {
                    this.sortBy(ev, data);
                    this.saveSelected(data.el);
                }
            });
            this.get(["sorted_by", "sort_reversed"], function(items) {
                if (items.sorted_by) {
                    this.applySavedSort(items);
                }
            }, this);
        });
    }

    return flight.component(sortControls, withPageActions, withStorage);

})();
