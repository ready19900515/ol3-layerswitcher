ol.control.LayerSwitcher = function(opt_options) {

    var options = opt_options || {};

    var hiddenClassName = 'ol-unselectable ol-control layer-switcher';
    this.hiddenClassName = hiddenClassName;

    var shownClassName = hiddenClassName + ' shown';
    this.shownClassName = shownClassName;

    var element = document.createElement('div');
    element.className = hiddenClassName;

    var button = document.createElement('button');
    element.appendChild(button);

    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    element.appendChild(this.panel);

    var this_ = this;

    element.onmouseover = function(e) {
        this_.showPanel();
    };

    button.onclick = function(e) {
        this_.showPanel();
    };

    element.onmouseout = function(e) {
        e = e || window.event;
        if (!element.contains(e.toElement)) {
            this_.hidePanel();
        }
    };

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

};

ol.inherits(ol.control.LayerSwitcher, ol.control.Control);

ol.control.LayerSwitcher.prototype.showPanel = function() {
    if (this.element.className != this.shownClassName) {
        this.element.className = this.shownClassName;
        this.render(this.getMap());
    }
};

ol.control.LayerSwitcher.prototype.hidePanel = function() {
    this.element.className = this.hiddenClassName;
};

ol.control.LayerSwitcher.prototype.setMap = function(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    var this_ = this;
    map.on('pointerdown', function() {
        this_.hidePanel();
    });
    this.render(map);
};

ol.control.LayerSwitcher.prototype.setState = function(map, lyr) {
    lyr.setVisible(!lyr.getVisible());
    if (lyr.get('type') === 'base') {
        // Hide all other base layers regardless of grouping
        ol.control.LayerSwitcher.forEachRecursive(map, function(l, idx, a) {
            if (l.get('type') === 'base' && l != lyr) {
                l.setVisible(false);
            }
        });
    }
    this.render(map);
};

ol.control.LayerSwitcher.prototype.renderLayer = function(lyr, idx) {

    var this_ = this;

    var li = document.createElement('li');

    var lyrTitle = lyr.get('title');
    var lyrId = lyr.get('title').replace(' ', '-') + '_' + idx;

    var label = document.createElement('label');

    if (lyr.getLayers) {

        li.className = 'group';
        label.innerHTML = lyrTitle;
        li.appendChild(label);
        var ul = document.createElement('ul');
        li.appendChild(ul);

        this.renderLayers(lyr, ul);

    } else {

        var input = document.createElement('input');
        if (lyr.get('type') === 'base') {
            input.type = 'radio';
            input.name = 'base';
        } else {
            input.type = 'checkbox';
        }
        input.id = lyrId;
        input.checked = lyr.get('visible');
        input.onchange = function(e) {
            this_.setState(this_.getMap(), lyr);
        };
        li.appendChild(input);

        label.htmlFor = lyrId;
        label.innerHTML = lyrTitle;
        li.appendChild(label);

    }

    return li;

};

ol.control.LayerSwitcher.prototype.renderLayers = function(lyr, elm) {
    var lyrs = lyr.getLayers().getArray().slice().reverse();
    for (var i = 0, l; i < lyrs.length; i++) {
        l = lyrs[i];
        if (l.get('title')) {
            elm.appendChild(this.renderLayer(l, i));
        }
    }
}

ol.control.LayerSwitcher.prototype.render = function(map) {

    var this_ = this;

    while(this.panel.firstChild) {
        this.panel.removeChild(this.panel.firstChild);
    }

    var ul = document.createElement('ul');
    this.panel.appendChild(ul);

    this.renderLayers(map, ul);

};

/**
 * Call the supplied function for each layer in the passed layer group
 * recursing nested groups. Signature for fn is the same as
 * ol.Collection#forEach
 */
ol.control.LayerSwitcher.forEachRecursive = function(lyr, fn) {
    lyr.getLayers().forEach(function(lyr, idx, a) {
        fn(lyr, idx, a);
        if (lyr.getLayers) {
            ol.control.LayerSwitcher.forEachRecursive(lyr, fn);
        }
    });
};
