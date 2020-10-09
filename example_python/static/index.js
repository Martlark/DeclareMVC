class ChildModel extends DeclareMVCChild {
    constructor(props) {
        super(props);
    }

    clickRemoveChild() {
        this.remove();
    }
}

class CreateChildModel extends DeclareMVCChild {
    constructor(props) {
        super(props);
    }

    clickRemoveChild() {
        this.remove();
    }

    clickToggleCase() {
        if (this.name.toUpperCase() !== this.name) {
            this.name = this.name.toUpperCase();
        } else {
            this.name = this.name.toLowerCase();
        }
    }

    create(index, parentElement) {
        return `          
        <tr>
            <td>
                <button data-click="clickRemoveChild()" data-index="${index}">Remove</button>
                <span data-text="id"></span></td>
            <td data-text="title"></td>
            <td data-text="name"></td>
            <td><input data-set="name"></td>
            <td><button data-click="clickToggleCase()">Case Switch</button></td>
        </tr>`;
    }
}

class PlainNameModel {
    constructor(props) {
        this.props = props;
        this.id = props.id;
        this.name = props.name;
    }
}

class CreateByClass {
    constructor(props) {
        this.props = props;
        this.message = '';
        this.count = 0
    }

    clickMe(message) {
        this.count++;
        this.message = `${message} ${this.count}`;
    }

    create() {
        return `<div><span>Hello there</span><button data-click="clickMe('hello')">hello</button><span class="error" data-text="message"></span></div>`;
    }
}

class ViewModel extends DeclareMVC {
    constructor(props) {
        super(props);
        this.title = 'Declare MVC Example';
        this.titleColors = ['yellow', 'green', 'blue'];
        this.titleAttrIndex = 0;
        this.titleAttributes = {style: `background: ${this.titleColors[this.titleAttrIndex]}`};
        this.counter = 0;
        this.num = 20;
        this.numberToAdd = 2000;
        this.inputValue = '';
        this.text_area = '';
        this.checkboxValue = true;
        this.select_value = 'feline';
        this.ajax_value = '';
        this.funcValue = '';
        this.number_to_double = 1;
        this.animals = [{value: 'dog', label: 'Dog'}, {value: 'feline', label: 'Cat'}];
        this.otherChildren = {};
        this.createChildren = {};
        this.plainChildren = {};
        this.createByClass = new CreateByClass({flong: 'pong'});

        $(document).ready(() => {
            $.ajax('/slow_names').then(results => {
                this.childrenAdd(results.map(r => new PlainNameModel(r)), this.plainChildren);
            });

            $.ajax('/names').then(results => {
                this.childrenAdd(results.map(r => new ChildModel(r)));
                results.forEach(child => {
                    child.id += 500;
                    this.childrenAdd(new ChildModel(child), this.otherChildren);
                    this.childrenAdd(new CreateChildModel(child), this.createChildren);
                });
            }).always(() => {
                $('#loading_finished').text('finished');
            });
        });
    }

    htmlTable() {
        return "<table style='border: black 1px solid; border-collapse: separate'><tr><td>hello</td><td>world</td></tr><tr><td>goodbye</td><td>next row</td></tr></table>";
    }

    clickAjax() {
        return $.ajax(`/ajax/${this.number_to_double}`).then(result => this.ajax_value = result).fail((xhr, textStatus, errorThrown) =>
            this.ajax_value = `${textStatus}`
        );
    }

    func(newValue) {
        if (typeof newValue == "undefined") {
            return this.funcValue;
        }
        this.funcValue = newValue.toString().toUpperCase();
    }

    clickTitleNextColor() {
        if (++this.titleAttrIndex >= this.titleColors.length) {
            this.titleAttrIndex = 0;
        }
        this.titleAttributes = {style: `background: ${this.titleColors[this.titleAttrIndex]}`};
    }

    clickAddChild() {
        const id = Math.round(Math.random() * 100000);
        this.childrenAdd(new ChildModel({id: id, name: `Child ${id}`, title: 'Mrs'}));
        return true;
    }

    clickClearOtherChild() {
        this.childrenClear(this.otherChildren);
    }

    clickClearChildren() {
        this.childrenClear();
    }

    clickAddOtherChild(numberToAdd = 1) {
        for (let i = 0; i < numberToAdd; i++) {
            const id = Math.round(Math.random() * 100000);
            this.otherChildren[id] = new ChildModel({
                id: id,
                name: `Added Other Child ${id}`,
                title: 'Mrs',
                _parent: this,
                _parentList: this.otherChildren
            });
        }
    }

    clickClearCreateChildren() {
        this.childrenClear(this.createChildren);
    }

    clickAddCreateChild(numberToAdd = 1) {
        for (let i = 0; i < numberToAdd; i++) {
            const id = Math.round(Math.random() * 100000);
            this.createChildren[id] = new CreateChildModel({
                id: id,
                name: `Added Create Child ${id}`,
                title: 'Ms',
                _parent: this,
                _parentList: this.createChildren
            });
        }
    }

    clickButton1(value) {
        this.counter += value;
    }
}

const viewModel = new ViewModel();
