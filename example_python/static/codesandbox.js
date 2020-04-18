class ToDoModel {
  constructor(props) {
    this.id = props.id;
    this.thing = props.thing;
    this.done = false;
    this.newThing = props.thing;
  }
  clickDone() {
    this.done = true;
  }
  clickRemove() {
    this._parent.childrenRemove(this);
  }
  clickEditThing() {
    if (this.editThing) {
      this.editThing = false;
      this.thing = this.newThing;
    } else {
      this.editThing = true;
    }
  }
  clickEditThingCancel() {
    this.editThing = false;
    this.newThing = this.thing;
  }
}

class viewController extends DeclareMVC {
  constructor() {
    super();
    this.inputValue = "type in input to change";
    this.buttonOutput = "press 'click me' to update";
    this.clickCount = 0;
    this.selectOptions = [
      { value: 1, label: "one" },
      { value: 2, label: "two" },
      { value: 3, label: "three" }
    ];
    this.selectValue = 2;
    this.childrenAdd(new ToDoModel({ id: 1, thing: "Do that one thing" }));
    this.childrenAdd(
      new ToDoModel({ id: 2, thing: "Do the other thing", done: false })
    );
  }
  clickButton() {
    this.buttonOutput = `hello number ${++this.clickCount}`;
  }
  clickAdd() {
    const nextId = Math.max(...Object.keys(this.children)) + 1;
    this.childrenAdd(
      new ToDoModel({ id: nextId, thing: `Another thing ${nextId}` })
    );
  }
}

const view = new viewController();
