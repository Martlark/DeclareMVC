class ComponentCounter extends DeclareMVC {
    constructor(parentSelector, parent) {
        super(parentSelector, parent);
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
