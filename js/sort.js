//
// returns an array of "story" meta-objects
function getStories(tbody) {
    if (getStories._vals) {
        return getStories._vals;
    }
    var triplets = [];
    // the first trow of each story
    $("#articlesTable tr.athing").each(function(i, el) {
        var subtext = this.nextElementSibling.getElementsByClassName("subtext")[0];
        if (subtext) {
            addSubtextHooks(subtext);
            triplets.push(createMetaObj(this, i, length));
        }
    });
    getStories._vals = triplets;
    return getStories._vals;
}    

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

// wraps the given text node with a <span>
function wrapTextNode(node, clazz) {
    var el = document.createElement("span");
    var clone = node.cloneNode(true);
    el.className = clazz;
    el.appendChild(clone);
    node.parentNode.replaceChild(el, node);
    el.replaceChild(node, clone);
    return clone;
}

// splits a text node in two at the specified offset
// and returns a reference to the first half (which
// is the original node)
function splitTextNode(node, offset) {
    var val = node.nodeValue; 
    var txt = document.createTextNode(val.substring(offset, val.length));
    node.nodeValue = val.substring(0, offset);
    node.parentNode.insertBefore(txt, node.nextSibling);
    return node;
}

// marks the given sort link as selected and unmarks its siblings
function updateSelected(link) {
    var sibs = link.parentNode.childNodes;
    for (var i = 0; i < sibs.length; i++) {
        if (sibs[i].nodeType != sibs[i].ELEMENT_NODE)
            continue;
        sibs[i].style.fontWeight = (sibs[i] == link) ? "bold" : "normal";
    }
}

// generates an array of CSS rules
function genStyles(selectors, name) {
    var rules = [];
    for (var sel in selectors) {
        rules.push(selectors[sel] + "{color:" + 
            (sel === name ? "red" : "inherit") + " !important;}")
    }
    return rules.join("\n");
}

// applies latest styles (based on which sort link is selected)
function updateStyles(selected) {
    var selectors = {
        age: "#articlesTable td.subtext .age",
        points: "#articlesTable .subtext .score",
        comments: "#articlesTable .subtext a:last-child"
    };
    var styles = genStyles(selectors, selected);
    $("#hnsort").html(styles);
}

function createSortLink(text, sortKey) {
    var link = document.createElement("a");
    link.appendChild(document.createTextNode(chrome.i18n.getMessage("sort_by_" + text)));
    link.href = "#";
    link.addEventListener("click", function(e) { 
        var tbody = $("#articlesTable tbody:first").get(0);
        sort(tbody, (sortKey || text), (link.style.fontWeight == "bold"));
        updateSelected(link);
        updateStyles(text);
        return false;
    }, false);
    return link;
}

function sort(tbody, sortKey, sorted) {
    var refEl = $(tbody).find("tr:nth-last-child(2)").get(0);
    (function(stories) {
        return sorted ? stories.reverse() : 
            stories.sort(function(a, b) { 
                return b[sortKey] - a[sortKey] 
            });
    })(getStories(tbody)).forEach(function(el) {
        el.elements.forEach(function(item) { 
            tbody.insertBefore(item, refEl)
        });
    });
}

// adds an empty style element to the head of the document 
// that can be later retrieved by ID and updated
function addStyleElement() {
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = "hnsort";
    head.appendChild(style);
}

function getArticlesTable() {
    // the first table wraps everything; the second table is the header bar;
    // the third table contains the articles (there's no great way to target
    // most elements on hn)
    return document.getElementsByTagName("table")[2];
}

// the first hn spacer row
function getEmptyRow() {
    // see earlier comment about selecting elements on hn
    return document.querySelector("tr[style='height:10px']");
}

function insertControls() {
    var emptyRow = getEmptyRow();
    var articlesTable = getArticlesTable();
    var linksWrapper = document.createElement("td"); 
    linksWrapper.id = "sortLinks";
    linksWrapper.className = "sort-action";
    articlesTable.id = "articlesTable";
    var links = [
        createSortLink("number", "rank"),
        createSortLink("points"),
        createSortLink("age"),
        createSortLink("comments")];
    links[0].style.fontWeight = "bold";
    linksWrapper.appendChild(document.createTextNode(chrome.i18n.getMessage("sort_by_label")));
    for (var i = 0; i < links.length; i++) {
        if (i != 0)
            linksWrapper.appendChild(document.createTextNode(" | "));
        linksWrapper.appendChild(links[i]);
    }
    // we're using the empty row as a pivot point and duplicating its
    // hacky spacing behavior
    emptyRow.parentNode.insertBefore(emptyRow.cloneNode(true), emptyRow);
    emptyRow.parentNode.insertBefore(emptyRow.cloneNode(true), emptyRow.nextElementSibling);
    emptyRow.appendChild(linksWrapper);
}

