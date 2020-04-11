class PersonModel {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.name = props.name;
        this._parentList = props._parentList;
    }

    clickRemovePerson() {
        console.log('remove', this.id);
        delete this._parentList[this.id];
    }
}

class ViewModel extends DeclareMVC {
    constructor(props) {
        super(props);
        this.counter = 0;
        this.inputValue = '';
        this.checkboxValue = false;
        this.selectValue = '';
        this.otherChildren = {};
        $(document).ready(() => {
            $.ajax('/names').then(results => {
                results.forEach(child => this.addChild(child.id, new PersonModel(child)));
                results.forEach(child => {
                    child._parentList = this.otherChildren;
                    child.id += 500;
                    this.otherChildren[child.id] = new PersonModel(child);
                });
            });
        });
    }

    addChild(id, child) {
        child._parentList = this.children;
        this.children[id] = child;
    }

    clickAddPerson() {
        const id = Math.round(Math.random() * 100000);
        this.addChild(id, new PersonModel({id: id, name: `Person ${id}`, title: 'Mrs'}));
    }

    clickButton1() {
        this.counter++;
    }
}

let viewModel = new ViewModel();
