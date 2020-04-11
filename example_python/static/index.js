class PersonModel {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.name = props.name;
        this._parentList = props._parentList;
        this._parent = props._parent;
    }

    clickRemovePerson() {
        delete this._parentList[this.id];
    }

    clickRemoveListPerson() {
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
                results.forEach(child => this.addChild(new PersonModel(child)));
                results.forEach(child => {
                    child.id += 500;
                    this.addChild(new PersonModel(child), this.otherChildren);
                    child.id += 500;
                    this.addChild(new PersonModel(child), this.listChildren);
                });
            });
        });
    }

    clickAddPerson() {
        const id = Math.round(Math.random() * 100000);
        this.addChild(new PersonModel({id: id, name: `Person ${id}`, title: 'Mrs'}));
        return true;
    }

    clickAddListPerson() {
        const id = Math.round(Math.random() * 100000);
        this.listChildren.push(new PersonModel({id: id, name: `Added Person ${id}`, title: 'Mrs'}));
    }

    clickButton1() {
        this.counter++;
    }
}

const viewModel = new ViewModel();
