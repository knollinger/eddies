/**
 * @param table
 *            die id oder direkt die referenz auf die Tabelle
 */
var TableDecorator = function(table) {

    this.table = UIUtils.getElement(table);
    this.thead = this.table.getElementsByTagName("thead")[0];
    this.hdrCols = this.thead.getElementsByTagName("th");
    this.tbody = this.table.getElementsByTagName("tbody")[0];
    this.makeColsSortable();
    this.createTableSearcherIcon();
}

/**
 * Füge für alle als sortable markierten Columns die EventListener hinzu
 */
TableDecorator.prototype.makeColsSortable = function() {

    for (var i = 0; i < this.hdrCols.length; i++) {
        if (UIUtils.hasClass(this.hdrCols[i], "sortable")) {
            this.makeColSortable(this.hdrCols[i], i);
        }
    }
}

/**
 * Füge für eine einzelne Col die Sort-EventListener hinzu
 * 
 * @param col
 * @param idx
 */
TableDecorator.prototype.makeColSortable = function(col, idx) {

    var self = this;
    col.addEventListener("click", function() {
        self.sortByCol(col, idx);
    });
}

/**
 * Sortiere die Tabelle anhand der angegebenen Spalten-Nummer
 * 
 * @param colNr
 */
TableDecorator.prototype.sortByCol = function(col, colNr) {

    var direction = UIUtils.hasClass(col, "sort_dsc") ? -1 : 1;
    var newClass = UIUtils.hasClass(col, "sort_dsc") ? "sort_asc" : "sort_dsc";
    var rows = UIUtils.getChildsAsArray(this.tbody, "tr");
    rows.sort(function(row1, row2) {

        var col1 = row1.getElementsByTagName("td")[colNr].textContent;
        var col2 = row2.getElementsByTagName("td")[colNr].textContent;
        if (col1 > col2) {
            return direction;
        }
        if (col2 > col1) {
            return direction * -1;
        }
        return 0;

    });

    // fill in the reorderd rows
    UIUtils.clearChilds(this.tbody);
    UIUtils.appendMultipleChilds(this.tbody, rows);

    // reconfigure the column headers
    for (var i = 0; i < this.hdrCols.length; i++) {
        UIUtils.removeClass(this.hdrCols[i], "sort_dsc");
        UIUtils.removeClass(this.hdrCols[i], "sort_asc");
        if (i == colNr) {
            UIUtils.addClass(this.hdrCols[i], newClass);
        }
    }
}

/**
 * Erzeuge das Icon für den Tablesearch. Das Icon wird in der letzten
 * Header-Spalte eingetragen und per float rechts ausgerichtet. Um dies zu
 * ermöglichen wird der eigentliche Text-Content der Tabelle in ein Span
 * gepackt. Der Span floated links, das Icon floated rechts.
 */
TableDecorator.prototype.createTableSearcherIcon = function() {

    var self = this;
    var lastColumn = this.hdrCols[this.hdrCols.length - 1];

    var span = document.createElement("span");
    span.textContent = lastColumn.textContent;
    span.style.float = "left";
    lastColumn.textContent = null;
    lastColumn.appendChild(span);

    this.searchIcon = document.createElement("img");
    this.searchIcon.src = "gui/images/table_search.png";
    this.searchIcon.style.float = "right";
    lastColumn.appendChild(this.searchIcon);
    this.searchIcon.addEventListener("click", function(evt) {
        evt.stopPropagation();
        self.showTableSearcher();
    });
    lastColumn.appendChild(UIUtils.createClearFix());
}

/**
 * Zeige den TableSearcher an.- Das Eingabefeld wird so positioniert, das es
 * unterhalb und links von Icon steht
 */
TableDecorator.prototype.showTableSearcher = function() {

    var glasspane = this.createGlasspane();
    var edit = this.createSearchInput();
    glasspane.appendChild(edit);

    var iconRect = this.searchIcon.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();
    edit.className = "search-field";
    edit.style.right = bodyRect.width - iconRect.right + iconRect.width;
    edit.style.top = iconRect.bottom;
    edit.placeholder = edit.title = "Suchbegriffe eingeben";
    edit.focus();    
}

/**
 * Erzeugt die Glasspane für den Table-Searcher und bindet die nötigen
 * EventListener
 * 
 * @returns {___anonymous3602_3610}
 */
TableDecorator.prototype.createGlasspane = function() {

    var self = this;

    var glasspane = document.createElement("div");
    glasspane.className = "glasspane";
    document.body.appendChild(glasspane);

    glasspane.addEventListener("click", function(evt) {
	glasspane.parentElement.removeChild(glasspane);
        var target = document.elementFromPoint(evt.clientX, evt.clientY);
        while (target.tagName != "BODY") {
            if (target.tagName == "TR") {
                target.click();
                break;
            }
            target = target.parentElement;
        }
        self.removeTableFilter();
        target.focus();
    });

    glasspane.addEventListener("keyup", function(evt) {
        if (evt.keyCode == 27) {
            evt.stopPropagation();
            glasspane.parentElement.removeChild(glasspane);
            self.removeTableFilter();
        }
    });
    return glasspane;
}

/**
 * Erzeugt das Eingabefeld für den TableSearcher und bindet die nötigen
 * EventListener
 * 
 * @returns {___anonymous4493_4496}
 */
TableDecorator.prototype.createSearchInput = function() {

    var edit = document.createElement("input");
    edit.className = "tabsearch_input";

    var self = this;
    edit.addEventListener("input", function() {
        self.filterTable(edit.value);
    });
    edit.addEventListener("click", function(evt) {
        evt.stopPropagation();
    });
    return edit;
}

/**
 * Filtere die Tabelle, indem alle TRs des bodies auf display none gesetzt
 * werden, welche den suchtext nicht beinhalten
 * 
 * @param filter
 */
TableDecorator.prototype.filterTable = function(filter) {

    filter = filter.toLowerCase();
    var rows = this.tbody.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        if (!rows[i].textContent.toLowerCase().includes(filter)) {
            UIUtils.addClass(rows[i], "tabsearch_hide_row");
        } else {
            UIUtils.removeClass(rows[i], "tabsearch_hide_row");
        }
    }
}

/**
 * Entferne den Filter aus der Tabelle, es werden also alle TR's wieder
 * angezeigt
 */
TableDecorator.prototype.removeTableFilter = function() {

    var rows = this.tbody.getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        UIUtils.removeClass(rows[i], "tabsearch_hide_row");
    }
}