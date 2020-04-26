class ComponentCounter extends DeclareMVC {
    constructor(parentSelector) {
        super(parentSelector);
        this.counter = 0;
        this._parentSelector = parentSelector;
    }

    clickAdd() {
        this.counter++;
    }

    clickSubtract() {
        this.counter--;
    }

    create(index, parentElement) {
        return `
        <div>
            <p>A component</p>
            <button data-click="clickAdd()">Add</button>
            <button data-click="clickSubtract()">Subtract</button>
            <p data-text="counter"></p>
        </div>`
    }
}
