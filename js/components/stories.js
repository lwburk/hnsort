var Stories = (function() {

    // creates a meta-object with details for the given headline; used later 
    // to determine sort order
    function createMetaObj(headline, pos) {
        var subtext = headline.nextElementSibling;
        var fields = subtext.textContent.trim().split(/\s+/); 
        var meta = {
            elements: [headline, subtext, subtext.nextElementSibling],
            rank: -pos,
            parts: fields, // this is really just for debugging
            points: 0,
            comments: 0,
            age: 0
        };
        fields.forEach(function(val, i, arr) {
            if (val === "points") {
                meta["points"] = parseInt(fields[i - 1], 10);
            } else if (val === "comments" || val === "comment") {
                meta["comments"] = parseInt(fields[i - 1], 10);
            } else if (val === "ago") {
                meta["age"] = (new Date()).getTime() - 
                    (parseInt(fields[i - 2], 10) * getMultiplier(fields[i - 1]));
            } 
        });
        return meta;
    }

    function getMultiplier(unit) {
        var mult = 1;
        switch (unit) {
            case "day":
            case "days":
                mult *= 24;
            case "hour":
            case "hours":
                mult *= 60;
            case "minute":
            case "minutes":
                mult *= 60;
            case "second":
            case "seconds":
                mult *= 1000;
        }
        return mult;
    }

    var _stories = null;

    function stories() {

        this.attributes({
            "articles": "tr.athing",
            "articlesTableBody": "tbody:first",
            "lastArticle": "tr.spacer:last",
            "commentLinks": ".subtext a:contains('comment')"
        });
   
        // returns an array of "story" meta-objects
        this.getStories = function() {
            if (!_stories) {
                _stories = this.select("articles").map(function(i, el) {
                    return createMetaObj(this, i);
                }).get();
            }
            return _stories;
        };

        this.setupArticlesTable = function() {
            this.$node.addClass("articles");
            this.select("commentLinks").addClass("comments");
        };

        this.messagesObject = function() {
            var messages = {};
            var labels = [].slice.call(arguments);
            labels.forEach(function(label) {
                messages[label] = chrome.i18n.getMessage(label);
            });
            return messages;
        };

        this.renderSortControls = function() {
            var template = 
                '<div id="sortLinks" class="sort-action">&nbsp;&nbsp;{{sort_by_label}}\
                    <a href="#" data-key="#" class="selected">{{sort_by_number}}</a> |\
                    <a href="#" data-key="points">{{sort_by_points}}</a> |\
                    <a href="#" data-key="age">{{sort_by_age}}</a> |\
                    <a href="#" data-key="comments">{{sort_by_comments}}</a>\
                </div>';
            var messages = this.messagesObject(
                "sort_by_label", "sort_by_number", "sort_by_points", "sort_by_age", "sort_by_comments");
            this.$node.before(Mustache.render(template, messages));
        };

        this.sortBy = function(ev, data) {
            var element = data && data.el;
            if (!element) {
                return;
            }
            var sortKey = $(element).data("key");
            var tbody = this.select("articlesTableBody");
            tbody.removeClass().addClass(sortKey);
            this.sort(
                tbody.get(0),
                sortKey === "#" ? "rank" : sortKey, 
                data.alreadySelected);
        };

        this.sort = function(tbody, sortKey, sorted) {
            var refEl = this.select("lastArticle").next().get(0);
            (function(stories) {
                return sorted ? stories.reverse() : 
                    stories.sort(function(a, b) { 
                        return b[sortKey] - a[sortKey] 
                    });
            })(this.getStories()).forEach(function(el) {
                el.elements.forEach(function(item) { 
                    tbody.insertBefore(item, refEl)
                });
            });
        };

        this.after('initialize', function() {
            this.setupArticlesTable();
            this.renderSortControls();
            this.on(document, "uiSortBy", this.sortBy);
        });
    }

    return flight.component(stories);

})();
