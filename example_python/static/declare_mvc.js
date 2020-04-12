class DeclareMVC {
    constructor(props) {
        this.children = {};
        this._parentSelector = props || 'body';
        $(document).ready(() => this._start());
    }

    /* public methods */

    mutated() {
        /**
         * update elements on the page after something may have
         * changed
         */
        if (this._dataRepeat()) {
            this._dataValue();
        }
        this._dataText();
        this._dataVisible();
    }

    childAdd(child, childrenProp) {
        childrenProp = childrenProp || this.children;
        child._parent = this;
        child._parentList = childrenProp;
        if (Array.isArray(childrenProp)) {
            childrenProp.push(child);
        } else {
            childrenProp[child.id] = child;
        }
        this.mutated();
    }

    childrenClear(childrenProp) {
        childrenProp = childrenProp || this.children;
        if (Array.isArray(childrenProp)) {
            childrenProp.length = 0;
        } else {
            Object.keys(childrenProp).forEach(k => {
                delete childrenProp[k];
            });
        }
        this.mutated();
    }

    /* private methods */

    _evalError(thing, _context) {
        try {
            return eval(thing);
        } catch (e) {
            console.error(e, thing);
        }
        return null;
    }

    _dataGetContext(el, m) {
        const id = $(el).closest('[data-child-id]').data('child-id');
        const prop = $(el).closest('[data-repeat]').data('repeat') || $(el).closest('[data-prop]').data('prop');
        let _context = this.children[Number(id)] || this;
        if (prop) {
            _context = eval(`this.${prop}[Number(id)]`) || this;
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
        this.mutated();
    }

    _dataClick() {
        /**
         * add handles for a click event.
         */
        $("body").on('click', "[data-click]", el => {
            const [_context, m] = this._dataGetContext(el.target, $(el.target).data('click'));
            if (!this._evalError(m, _context))
                this.mutated();
        });
    }

    _dataVisible() {
        $("[data-visible]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('visible'));
            const newState = this._evalError(m, _context);
            if (newState !== $(el).is(':visible')) {
                if (newState) {
                    $(el).show();
                } else {
                    $(el).hide();
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
            const [_context, m] = this._dataGetContext(el, $el.data('repeat'));
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
                    const element = $(state.html);
                    element.attr('data-child-id', k);
                    $el.append(element);
                    hasMutated = true;
                }
            });
        });
        return hasMutated;
    }


    _dataText() {
        $("[data-text]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('text'));
            let text = this._evalError(m, _context).toString();
            const el_text = $(el).text();
            if (text !== el_text) {
                $(el).text(text);
            }
        });
        $("[data-attr]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('attr'));
            let props = this._evalError(m, _context);
            Object.keys(props).forEach(k => {
                const el_text = $(el).attr(k) || '';
                if (props[k] !== el_text) {
                    $(el).attr(k, props[k]);
                }
            });
        });
    }

    _dataValue() {
        /***
         * set the value of an input from a instance prop when first used.
         * set up select option values
         *
         */
        $("[data-options]", this._parentSelector).each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('options'));
            const options = this._evalError(m, _context) || [];
            $(el).html(null);
            options.forEach(opt => {
                $(el).append(`<option value=${opt.value || opt}>${opt.label || opt}</option>`);
            })
        });

        $("[data-set]", this._parentSelector).each((index, el) => {
            const tagName = $(el)[0].tagName;
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
                const [_context, m] = this._dataGetContext(el, $(el).data('set'));
                const text = this._evalError(m, _context) || '';
                if (text.toString() !== $(el).val()) {
                    $(el).val(text);
                }
            }
        });
    }

    _dataSet() {
        /**
         * set a prop of an object instance from an input type
         */
        const set = (el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('set'));
            let v = $(el).val() || '';
            v = v.replace(/"/g, '\\"');
            let setter = `${m}="${v}"`;
            const tagName = $(el)[0].tagName;
            const tagType = $(el)[0].type;
            if (tagType === 'checkbox') {
                v = $(el).is(':checked');
                setter = `${m}=${v}`
            }else{
                switch(typeof eval(m)){
                    case "function":
                        setter = `${m}("${v}")`;
                        break;
                    case "number":
                        setter = `${m}=Number("${v}")`;
                        break;
                }
            }
            this._evalError(setter, _context);
            this.mutated();
        };
        $("[data-set]", this._parentSelector).each((index, el) => set(el));
        $(this._parentSelector).on('keyup change', "[data-set]", evt => set(evt.target));
    }
}
