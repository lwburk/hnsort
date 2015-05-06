var SortControls = (function() {

    function sortControls() {

        this.defaultAttrs({
            // selectors
            sortByCommentsSelector: 'a'
        });

        this.restyleOnSelectionChange = function(ev, data) {
    /*
            if (data.selectedIds.length > 1) {
              this.select('actionControlsSelector').not('button.single-item').removeAttr('disabled');
              this.select('singleItemActionSelector').attr('disabled', 'disabled');
            } else if (data.selectedIds.length == 1) {
              this.select('actionControlsSelector').removeAttr('disabled');
            } else {
              this.disableAll();
            }
    */
      };

        this.sortBy = function(ev, data) {
            console.log(ev);
            console.log(data);
        }

        this.after('initialize', function() {
            this.on('.sort-action', 'click', {
                'sortByCommentsSelector': this.sortBy
            });
        });
    }

    return flight.component(sortControls);

})();
