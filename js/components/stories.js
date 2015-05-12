
var Stories = (function() {

    // creates a meta-object with details for the given 
    // headline; used later to determine sort order
    function createMetaObj(headline, pos, length) {
        var subtext = headline.nextElementSibling;
        var res = subtext.textContent.split(/\s+/); 
        var isJobPosting = (res.length === 5);
        var agePos = isJobPosting ? 1 : 5;
        var commentsPos = (res[9] === "flag") ? 11 : 9;
        return {
            elements: [headline, subtext, subtext.nextElementSibling],
            rank: length - pos,
            points: !isJobPosting ? parseInt(res[1], 10) : 0,
            comments: !isJobPosting ? (parseInt(res[commentsPos], 10) || 0) : -1,
            age: (new Date()).getTime() - 
                    (parseInt(res[agePos], 10) * getMultiplier(res[agePos + 1]))
        }
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

    function addSubtextHooks(subtext) {
        // the timestamp is now a link on regular posts, but not on job posts, for 
        // some reason, so we can identify a regular post by the presence of a 
        // timestamp link
        var timeLink = subtext.getElementsByTagName("a")[1];
        var target = timeLink || subtext
        target.classList.add("age");
    }

    function stories() {

        this.defaultAttrs({
            "articlesTableBodySelector": "tbody:first",
            "articlesSelector": "tr.athing",
            "lastArticleSelector": "tr:nth-last-child(2)"
        });
   
        // returns an array of "story" meta-objects
        this.getStories = function() {
            if (this.getStories._vals) {
                return this.getStories._vals;
            }
            var triplets = [];
            // the first row of each story
            this.select("articlesSelector").each(function(i, el) {
                var subtext = this.nextElementSibling.getElementsByClassName("subtext")[0];
                if (subtext) {
                    addSubtextHooks(subtext);
                    triplets.push(createMetaObj(this, i, length));
                }
            });
            this.getStories._vals = triplets;
            return this.getStories._vals;
        };

        this.setupArticlesTable = function() {
            this.$node.addClass("articles");
        };

        this.renderSortControls = function() {
            var template = 
                '<div id="sortLinks" class="sort-action">&nbsp;&nbsp;{{sort_by_label}}\
                    <a href="#" class="selected">{{sort_by_number}}</a> |\
                    <a href="#">{{sort_by_points}}</a> |\
                    <a href="#">{{sort_by_age}}</a> |\
                    <a href="#">{{sort_by_comments}}</a>\
                </div>';
            this.$node.before(Mustache.render(template, {
                "sort_by_label": chrome.i18n.getMessage("sort_by_label"),
                "sort_by_number": chrome.i18n.getMessage("sort_by_number"),
                "sort_by_points": chrome.i18n.getMessage("sort_by_points"),
                "sort_by_age": chrome.i18n.getMessage("sort_by_age"),
                "sort_by_comments": chrome.i18n.getMessage("sort_by_comments")
            }));
        };

        this.sortBy = function(ev, data) {
            var element = data && data.el;
            if (!element) {
                return;
            }
            var sortKey = $(element).text();
            var tbody = this.select("articlesTableBodySelector");
            tbody.removeClass().addClass(sortKey);
            this.sort(
                tbody.get(0),
                sortKey === "#" ? "rank" : sortKey, 
                data.alreadySelected);
        };

        this.sort = function(tbody, sortKey, sorted) {
            var refEl = this.select("lastArticleSelector").get(0);
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
