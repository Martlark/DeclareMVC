class ChildModel {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.name = props.name;
        this._parentList = props._parentList;
        this._parent = props._parent;
    }

    clickRemoveChild() {
        delete this._parentList[this.id];
    }

    clickRemoveListChild() {
        this._parent.listChildren = this._parent.listChildren.filter(p => p.id !== this.id);
    }
}

class ViewModel extends DeclareMVC {
    constructor(props) {
        super(props);
        this.title = 'Declare MVC Example';
        this.h3Attributes = {style:'background: yellow'};
        this.counter = 0;
        this.inputValue = '';
        this.checkboxValue = false;
        this.selectValue = 'feline';
        this.animals = [{value: 'dog', label: 'Dog'}, {value: 'feline', label: 'Cat'}];
        this.otherChildren = {};
        this.listChildren = [];

        $(document).ready(() => {
            $.ajax('/names').then(results => {
                results.forEach(child => this.childAdd(new ChildModel(child)));
                results.forEach(child => {
                    child.id += 500;
                    this.childAdd(new ChildModel(child), this.otherChildren);
                    child.id += 500;
                    this.childAdd(new ChildModel(child), this.listChildren);
                });
            }).always(() => {
                $('#loading_finished').text('finished');
            });
        });
    }

    clickAddChild() {
        const id = Math.round(Math.random() * 100000);
        this.childAdd(new ChildModel({id: id, name: `Child ${id}`, title: 'Mrs'}));
        return true;
    }

    clickAddListChild() {
        const id = Math.round(Math.random() * 100000);
        this.listChildren.push(new ChildModel({
            id: id,
            name: `Added List Child ${id}`,
            title: 'Mrs',
            _parent: this,
            _parentList: this.otherChildren
        }));
    }

    clickClearListChild() {
        this.childrenClear(this.listChildren);
    }

    clickClearOtherChild() {
        this.childrenClear(this.otherChildren);
    }

    clickClearChildren() {
        this.childrenClear();
    }

    clickAddOtherChild() {
        const id = Math.round(Math.random() * 100000);
        this.otherChildren[id] = new ChildModel({
            id: id,
            name: `Added Other Child ${id}`,
            title: 'Mrs',
            _parent: this,
            _parentList: this.otherChildren
        });
    }

    clickButton1() {
        this.counter++;
    }
}

const viewModel = new ViewModel();
