class PersonModel {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.name = props.name;
        this._parent = props._parent;
    }

    clickRemovePerson() {
        console.log('remove', this.id);
        delete this._parent.children[this.id];
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
                    child._parent = this;
                    this.otherChildren[child.id] = new PersonModel(child)
                });
            });
        });
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
