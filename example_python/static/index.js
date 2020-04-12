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
        this.counter = 0;
        this.inputValue = '';
        this.checkboxValue = false;
        this.selectValue = 'feline';
        this.animals = [{value: 'dog', label: 'Dog'}, {value: 'feline', label: 'Cat'}];
        this.otherChildren = {};
        this.listChildren = [];
        $(document).ready(() => {
            $.ajax('/names').then(results => {
                results.forEach(child => this.addChild(new ChildModel(child)));
                results.forEach(child => {
                    child.id += 500;
                    this.addChild(new ChildModel(child), this.otherChildren);
                    child.id += 500;
                    this.addChild(new ChildModel(child), this.listChildren);
                });
            }).always(()=>{
                $('#loading_finished').text('finished');
            });
        });
    }

    clickAddChild() {
        const id = Math.round(Math.random() * 100000);
        this.addChild(new ChildModel({id: id, name: `Child ${id}`, title: 'Mrs'}));
        return true;
    }

    clickAddListChild() {
        const id = Math.round(Math.random() * 100000);
        this.listChildren.push(new ChildModel({id: id, name: `Added List Child ${id}`, title: 'Mrs'}));
    }

    clickAddOtherChild() {
        const id = Math.round(Math.random() * 100000);
        this.otherChildren[id] = new ChildModel({id: id, name: `Added Other Child ${id}`, title: 'Mrs'});
    }

    clickButton1() {
        this.counter++;
    }
}

const viewModel = new ViewModel();
