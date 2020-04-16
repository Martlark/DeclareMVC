/*
DeclareMVC a minimal declartive model view controller JavaScript HTML framework
Copyright (c) 2020 Andrew Rowe
rowe.andrew.d@gmail.com

version history
---------------
14-Apr-2020 1.0.0
14-Apr-2020 1.0.1 - improve error messages
14-Apr-2020 1.0.2 - improve error handling
14-Apr-2020 1.0.3 - use promise resolve after click
14-Apr-2020 1.0.4 - trap promise errors
14-Apr-2020 1.0.5 - remove data-repeat list support
15-Apr-2020 1.0.6 - improve refresh performance
 */


class DeclareMVC {
    constructor(props) {
        this.children = {};
        this._version = '1.0.6';
        this._parentSelector = props || 'body';
        $(document).ready(() => this._start());
    }

    /* ===== public methods ===== */

    /**
     * update elements on the page after something may have
     * changed
     */
    mutated(caller) {
        let changed = false;
        if (this._dataRepeat()) {
            this._dataValue();
            changed = true;
        }
        if( this._dataText() ){
            changed=true;
        }
        this._dataVisible();
        // console.log('mutated', caller, changed);
        return changed;
    }

    /***
     * Add a child or children to a model list property
     *
     * @param child: a single child or a list of children to add
     * @param childrenProp: (optional, defaults to children) the property to add the children to.
     */
    childrenAdd(child, childrenProp) {
        childrenProp = childrenProp || this.children;
        let children = child;
        if (!Array.isArray(child)) {
            children = [child];
        }
        children.forEach(child => {
            child._parent = this;
            child._parentList = childrenProp;
            childrenProp[child.id] = child;
        });
        this.mutated('childrenAdd');
    }

    /***
     * remove all items from a child list property
     * and then refresh the page
     *
     * @param childrenProp
     */
    childrenClear(childrenProp) {
        childrenProp = childrenProp || this.children;
        Object.keys(childrenProp).forEach(k => {
            delete childrenProp[k];
        });
        this.mutated('childrenClear');
    }

    /***
     * remove a child from it's list property
     * and then refresh the page.  For a list just marks it as removed.
     *
     * @param childrenProp
     */
    childrenRemove(child) {
        delete child._parentList[child.id];
        this.mutated('childrenRemove');
    }

    /* private methods */

    /**
     * evaluate a bit of JavaScript and return the result.  Logs errors and then
     * returns ''
     *
     * @param thing - javascript
     * @param _context - calling context
     * @param _value - a value to be used with the thing
     * @return {string|any} - the value as calculated
     * @private
     */
    _evalError(thing, _context, _value) {
        try {
            return eval(thing.replace(/\n/g, "\\n"));
        } catch (e) {
            console.error(e, thing);
        }
        return '';
    }

    /**
     * get the method and context for execution
     *
     * @param el - element data-* is located in
     * @param m - the method to evaluate
     * @param dataElement - the data-* name to be found
     * @return {(*|DeclareMVC)[]|*[]|(*|DeclareMVC|string)[]}
     * @private
     */
    _dataGetContext(el, m, dataElement) {
        const id = $(el).closest('[data-child-id]').data('child-id');
        const prop = $(el).closest('[data-repeat]').data('repeat') || $(el).closest('[data-prop]').data('prop');
        let _context = this.children[Number(id)] || this;

        if (prop) {
            _context = this[prop][Number(id)] || this;
        }
        if (!m) {
            console.log(`no method in [${dataElement}] for element: ${el}: ${el.innerText}`);
            return [null, null];
        }
        const leftPart = m.toString().split('(')[0];
        if (!isNaN(m) || leftPart.includes('.') || m.includes('&&') || m.includes('||')) {
            return [_context, m]
        }

        if (m.startsWith("!")) {
            m = '!_context.' + m.substr(1);
        } else {
            m = '_context.' + m;
        }
        return [_context, m]
    }

    _start() {
        this._dataValue(); // set initial input type values
        this._dataSet(); // set updaters from inputs
        this._dataClick(); // set clicks
        this.mutated('_start');
    }

    /**
     * add handles for a click event.
     */
    _dataClick() {
        $("body").on('click', "[data-click]", el => {
            let click = $(el.target).closest('[data-click]').data('click');
            const [_context, m] = this._dataGetContext(el.target, click, 'data-click');
            if (_context && m) {
                const value = this._evalError(m, _context);
                const res = () => {
                    this.mutated('_dataClick');
                    let intervals = 5;
                    const interval = setInterval(() => {
                        if (this.mutated(`_dataClick:${intervals}`)) {
                            if (--intervals <= 0) {
                                clearInterval(interval);
                            }
                        } else {
                            clearInterval(interval);
                        }
                    }, 50);
                }
                Promise.resolve(value).then(() => res()).catch(() => res());
            }
        });
    }

    _dataVisible() {
        $("[data-visible]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('visible'), 'data-visible');
            if (_context && m) {
                const newState = this._evalError(m, _context);
                if (newState !== $(el).is(':visible')) {
                    if (newState) {
                        $(el).show();
                    } else {
                        $(el).hide();
                    }
                }
            }
        });
    }

    _dataRepeat() {
        let hasMutated = false;
        $("[data-repeat]", this._parentSelector).each((index, el) => {
            const $el = $(el);
            let state = $el.data('repeat-state');
            if (!state) {
                let html = $el.html();
                $el.html(null);
                hasMutated = true;
                state = {html: html};
                $el.data('repeat-state', JSON.stringify(state));
            } else {
                state = JSON.parse((state));
            }
            const [_context, m] = this._dataGetContext(el, $el.data('repeat'), 'data-repeat');
            if (!(_context && m)) {
                return;
            }
            const keys = Object.keys(eval(m));
            const currentKeys = [];
            $('[data-child-id]', el).each((index, item) => {
                // remove any not in current children
                const childId = $(item).data('child-id').toString();
                if (keys.indexOf(childId) === -1) {
                    $(item).remove();
                    hasMutated = true;
                } else {
                    currentKeys.push(childId);
                }
            });
            // add any new
            keys.forEach(k => {
                if (currentKeys.indexOf(k.toString()) === -1) {
                    $el.append($(state.html).attr('data-child-id', k));
                    hasMutated = true;
                }
            });
        });
        return hasMutated;
    }


    _dataText() {
        let mutated = false;
        $("[data-text]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('text'), 'data-text');
            if (_context && m) {
                let text = this._evalError(m, _context);
                if (typeof text == "undefined")
                    text = '';
                else
                    text = text.toString();
                const el_text = $(el).text();
                if (text !== el_text) {
                    $(el).text(text);
                    mutated = true;
                }
            }
        });
        $("[data-attr]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('attr'), 'data-atrr');
            if (_context && m) {
                let props = this._evalError(m, _context);
                Object.keys(props).forEach(k => {
                    const el_text = $(el).attr(k) || '';
                    if (props[k] !== el_text) {
                        $(el).attr(k, props[k]);
                        mutated = true;
                    }
                });
            }
        });
        return mutated;
    }

    _dataValue() {
        /***
         * set the value of an input from a instance prop when first used.
         * set up select option values
         *
         */
        let mutated = false;
        $("[data-options]", this._parentSelector).each((index, el) => {
            const $el = $(el), [_context, m] = this._dataGetContext(el, $el.data('options'), 'data-options');
            if (!(_context && m)) {
                return;
            }
            let options = this._evalError(m, _context) || [];
            if ($el.data('options-state') !== JSON.stringify(options)) {
                $el.html(null);
                $el.data('options-state', JSON.stringify(options));
                options.forEach(opt => {
                    $el.append(`<option value=${opt.value || opt}>${opt.label || opt}</option>`);
                });
                mutated = true;
            }
        });

        $("[data-set]", this._parentSelector).each((index, el) => {
            const tagName = $(el)[0].tagName;
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
                const [_context, m] = this._dataGetContext(el, $(el).data('set'), 'data-set');
                const text = this._evalError(m, _context) || '';
                if (text.toString() !== $(el).val()) {
                    $(el).val(text);
                    mutated = true;
                }
            }
        });
        return mutated
    }

    _dataSet() {
        /**
         * set a prop of an object instance from an input type
         */
        const set = (el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('set'), 'data-set');
            if (!(_context && m)) {
                return;
            }
            let _value = $(el).val() || '';
            let setter = `${m}=_value`;
            const tagType = $(el)[0].type;
            if (tagType === 'checkbox') {
                _value = $(el).is(':checked');
                setter = `${m}=_value`
            } else {
                switch (typeof eval(m)) {
                    case "function":
                        setter = `${m}(_value)`;
                        break;
                    case "number":
                        setter = `${m}=Number(_value)`;
                        break;
                }
            }
            this._evalError(setter, _context, _value);
            this.mutated('_dataSet');
        };
        $("[data-set]", this._parentSelector).each((index, el) => set(el));
        $(this._parentSelector).on('keyup change blur', "[data-set]", evt => set(evt.target));
    }
}
