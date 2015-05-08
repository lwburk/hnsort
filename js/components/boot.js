
var Boot = (function() {

    // creates a meta-object with details for the given 
    // headline; used later to determine sort order
    function createMetaObj(headline, pos, length) {
        // TODO: this is really gross
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

    // wraps the "n hours ago" text in a span and gives it a class 
    // name so that it's easier to select later
    function addSubtextHooks(subtext) {
        // the timestamp is now a link on regular posts, but not on job posts, for 
        // some reason, so we can identify a regular post by the presence of a 
        // timestamp link
        var timeLink = subtext.getElementsByTagName("a")[1];
        var target = timeLink || subtext
        target.classList.add("age");
    }

    function boot() {

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
                '<div id="sortLinks" class="sort-action">&nbsp;&nbsp;Sort by\
                    <a href="#" class="selected">#</a> |\
                    <a href="#">points</a> |\
                    <a href="#">age</a> |\
                    <a href="#">comments</a>\
                </div>';
            this.$node.before(template);
        };

        this.sortBy = function(ev, data) {
            var element = data && data.el;
            if (!element) {
                return;
            }
            this.sort(
                this.select("articlesTableBodySelector").get(0), 
                $(element).text(), 
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

    return flight.component(boot);

})();
