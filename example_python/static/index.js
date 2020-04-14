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
        this.titleColors = ['yellow', 'green', 'blue'];
        this.titleAttrIndex = 0;
        this.titleAttributes = {style: `background: ${this.titleColors[this.titleAttrIndex]}`};
        this.counter = 0;
        this.num = 20;
        this.inputValue = '';
        this.text_area = '';
        this.checkboxValue = false;
        this.select_value = 'feline';
        this.ajax_value = '';
        this.funcValue = '';
        this.number_to_double = 1;
        this.animals = [{value: 'dog', label: 'Dog'}, {value: 'feline', label: 'Cat'}];
        this.otherChildren = {};
        this.listChildren = [];


        $(document).ready(() => {
            $.ajax('/names').then(results => {
                this.childrenAdd(results.map(r=>new ChildModel(r)));
                results.forEach(child => {
                    child.id += 500;
                    this.childrenAdd(new ChildModel(child), this.otherChildren);
                    child.id += 500;
                    this.childrenAdd(new ChildModel(child), this.listChildren);
                });
            }).always(() => {
                $('#loading_finished').text('finished');
            });
        });
    }

    clickAjax(){
        return $.ajax(`/ajax/${this.number_to_double}`).then(result=>this.ajax_value=result).fail((xhr, textStatus, errorThrown) =>
            this.ajax_value =`${textStatus}`
        );
    }

    func(newValue) {
        if( typeof newValue == "undefined"){
            return this.funcValue;
        }
        this.funcValue=newValue.toString().toUpperCase();
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

    clickButton1(value) {
        this.counter+=value;
    }
}

const viewModel = new ViewModel();
