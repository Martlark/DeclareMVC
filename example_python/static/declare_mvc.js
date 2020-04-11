class DeclareMVC {
    constructor(props) {
        this.children = {};
        $(document).ready(() => this._start());
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
        setInterval(() => {
            if (this._dataRepeat()) {
                this._dataValue();
            }
            this._dataText();
            this._dataVisible();
        }, 100);
    }

    _dataClick() {
        $("body").on('click', "[data-click]", el => {
            const [_context, m] = this._dataGetContext(el.target, $(el.target).data('click'));
            eval(m);
        });
    }

    _dataVisible() {
        $("[data-visible]").each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('visible'));
            const newState = eval(m);
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
        $("[data-repeat]").each((index, el) => {
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
        $("[data-text]").each((index, el) => {
            const [_context, m] = this._dataGetContext(el, $(el).data('text'));
            let text = eval(m) || '';
            text = text.toString();
            const el_text = $(el).text();
            if (text != el_text) {
                $(el).text(text);
            }
        });
    }

    _dataValue() {
        /***
         * set the value of an input from a instance prop
         */
        $("[data-set]").each((index, el) => {
            const tagName = $(el)[0].tagName;
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
                const [_context, m] = this._dataGetContext(el, $(el).data('set'));
                const text = eval(m);
                if (text != $(el).val()) {
                    $(el).val(text);
                }
            }
        });
    }

    _dataSet() {
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
            }
            eval(setter);
        };
        $("[data-set]").each((index, el) => set(el));
        $('body').on('keyup', "[data-set]", evt => set(evt.target));
        $('body').on('change', "[data-set]", evt => set(evt.target));
    }
}
