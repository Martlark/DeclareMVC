# DeclareMVC
A tiny ECMAScript 6 class based declarative JavaScript MVC that joins a HTML page to ordinary JavasScript
classes.

It features automatic context assignment, so no messing about with *this* or *bind()* is required.  Lightweight, it is 
ideal for adding UI behaviours to existing HTML pages and controllers.  Especially CRUD pages that require handling child
objects.

There is no support for extensions, life cycles or complicated rendering.  Use a templating language such as 
JINJA2 or similar for those uses.  The method for determining page updates is rather simple, any *data-click* or *data-set*
action causes an update event.  When adding to a child list use the *childrenAdd()* method to raise an update event.

Quick start
===========

Create a HTML page.

```html
    <head>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"
                integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/gh/martlark/declaremvc/declare_mvc.js"></script>
    </head>
    <body>
        <input>
        <p></p>
        <button>click me</button>
        <p></p>
    </body>
```

Create a controller for the page in JavaScript (index.js) and extend it using the class DeclareMVC. 

```javascript
    class viewController extends DeclareMVC{
        constructor() {
            super();
            this.inputValue = '';
            this.buttonOutput = '';
            this.clickCount = 0;
        }      
        clickButton(){
            this.buttonOutput = `hello number ${++this.clickCount}`;
        }   
    }
    const view = new viewController();

```

Add the controller to the page

```html
    <head>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"
                integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/gh/martlark/declaremvc/declare_mvc.js"></script>
    <script src="index.js"></script>
    </head>
    <body>
        <input>
        <p></p>
        <button>click me</button>
        <p></p>
    </body>
```

Add the declarations to the HTML to connect page actions to your controller.

```html
    <body>
        <input data-set="inputValue">
        <p data-text="inputValue"></p>
        <button data-click="clickButton()">click me</button>
        <p data-text="buttonOutput"></p>
    </body>
```

That's it!

Example on codesandbox:

https://codesandbox.io/embed/great-lichterman-b4ufu


Simple add via this CDN script.

    <script src="https://cdn.jsdelivr.net/gh/martlark/declaremvc/declare_mvc.js"></script>
    
   Or minimized:

    <script src="https://cdn.jsdelivr.net/gh/martlark/declaremvc/declare_mvc.min.js"></script>
    

Supports these declarations:

* data-set
* data-click
* data-children
* data-text
* data-visible
* data-options
* data-attr

Example:
========

Jquery is required.  Include declare_mvc.js as per the example from jsdelivr CDN.

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Example DeclareMVC application</title>
        <!-- jquery -->
        <script
                src="https://code.jquery.com/jquery-3.3.1.min.js"
                integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                crossorigin="anonymous"></script>
        <!-- declare MVC from CDN with a version -->
        <script src="https://cdn.jsdelivr.net/gh/martlark/declaremvc@1.0.5/declare_mvc.min.js"></script>
        <!-- your controller and models -->
        <script src="static/index.js"></script>
    </head>
    <body>
    ... ... ...
    
Extend your page controller (index.js) as shown:
    
```JavaScript
class ViewModel extends DeclareMVC {
    constructor(props) {
        super();
        this.counter = 0;
    }
    
    clickButton1() {
        this.counter++;
    }
}
// ... ... ...

const viewModel = new ViewModel();
```

DeclareMVC will start automatically once the page has completed loading.  

Declare your page controls that link your view model to the page, as per this example.

    <button data-click="clickButton1()">Add to counter</button>
    <p>counter:<span data-text="counter"></span></p>
    <h5 data-visible="counter > 10">Counter is greater than 10</h5>
    <h5 data-visible="counter < 10">Counter is less than 10</h5>

There are three data declarations here:

* data-click
* data-text
* data-visible

**data-click** links a view method to a button or clickable item on the page.  NOTE: there is no need to specify *viewModel*, *this* 
or *bind()*.  The correct context for calling the click method is determined by the HTML hierarchy.  In this example
a link to the *clickButton1()* method is made.

**data-text** links a property from the view to a text item on the page.  Whenever the property is changed the 
text for this element will change with it.  Any valid JavaScript that returns a value can be used.

**data-visible** shows or hides HTML based upon a property or method from the view controller.  Whenever the property
changes the visible status will be recalculated.  Any valid JavaScript can be used as long as it returns true or false.

As you can see DeclareMVC automatically handles the context of the view controller for the given HTML element.

Determining context
===================

DeclareMVC uses the element it is declared in to determine the correct context of the view controller to use.  It 
makes a simple scan of the **data-**="method" to allow it to add the context the method requires before it is called.  Any method value
that contains one of these: 

* . 
* && 
* || 

**must** completely specify the calling context, otherwise it is automatic.

A list of child objects
-----------------------
    
DeclareMVC is most useful to create a simple CRUD interface.  In this example the children property of the viewModel
is populated from a REST call.

    ....
        this.children = {};

    ....
        $(document).ready(() => {
            $.ajax('/names').then(results => {
                results.forEach(child => {
                    this.childrenAdd(new ChildModel(child));
                });
            });
        });
    ....
    
Each child class instance is set into the *this.children* object using the id of the child as the property key.  This is
the best way to organize children.  The *id* property of the child is **required**, it is used as the key for context
and managing HTML elements.
    
    <table>
        <thead>
        <tr>
            <th>id</th>
            <th>Title</th>
            <th>Name</th>
            <th>New Name</th>
        </tr>
        </thead>
            <tbody data-children="children">
            <tr>
                <td><button data-click="clickRemoveChild()">Remove</button><span data-text="id"></span></td>
                <td data-text="title"></td>
                <td data-text="name"></td>
                <td><input data-set="name"></td>
            </tr>
        </tbody>
    </table>

The HTML uses the *data-children* directive to create the <tr> rows of the table.  DeclareMVC will dynamically maintain the
list from the properties of the children.  Here the entire <tr> element will be repeated.  When items are removed the 
corresponding <tr> element will be removed as long as a *data-click* causes the removal, or *childrenClear()* is called.

Details
=======

data-set
--------

Sets an instance property from an input element such as a INPUT, SELECT or TEXTAREA.  On first use
the value from the controller/model property will be used to set the input value.  Thereafter the 
property value will be updated as the input changes from keystrokes or updates.

Example:

JavaScript model:

    class Address {
        constructor(){
            this.phone='';
        }
    }
    
HTML:

    <label>Phone number: <input type="number" data-set="phone"></label>

data-click
----------

Ties an element to an instance method for doing stuff when clicked.  Refreshes page elements after the click.  Return True to
suppress refresh.  Example:

JavaScript model:

    class ViewModel extends DeclareMVC {
        constructor(){
            ....
        }
        showAlert(){
            alert('hello');
        }
    }
    
HTML:

    <button data-click="showAlert()">Show Alert</button>

Return a promise from the click method and the page will update when
the promise is resolved.  Example:

    <button data-click="clickAjax()" id="ajax_click" title="calls ajax">Promise</button>


    clickAjax(){
        return $.ajax(`/ajax/${this.number_to_double}`).then(result=>this.ajax_value=result).fail((xhr, textStatus, errorThrown) =>
            this.ajax_value =`${textStatus}`
        );
    }


data-children
-----------

Repeats HTML element for each item in a child property, or creates a single child component.  Example:

JavaScript model:

    class ChildModel {
        constructor(id){
            this.id = id;
        }

    class ViewModel {
        constructor(){
        }
        
        for(let x=0; x < 3; x++){
            this.childrenAdd( new ChildModel(x) )
        }
    }
    
HTML:

    <table data-children="children">
        <tr><td data-text="id"></td></tr>
    </table>

RESULTANT HTML:

    <table data-children="children">
        <tr data-child-id="0"><td data-text="id">0</td></tr>
        <tr data-child-id="1"><td data-text="id">1</td></tr>
        <tr data-child-id="2"><td data-text="id">2</td></tr>
    </table>

As you can see *data-child-id* is added to each repeated element.  This is required to keep track of additions,
removals and context.  A unique *id* is **required** on each child Class instance.  The *childrenAdd* method is used
to add a child Class instance to the default *children* property.  This method causes the page to refresh after adding.

data-text
---------

Sets the text value of a HTML element from an instance property or method. Example:

JavaScript model:

    class ExampleModel {
        constructor(){
            this.phone='';
        }
        
        phoneNumberLength(){
            return this.phone.length;
        }
    }
    
HTML

    <h3 data-text="phone"></h3>
    <h3 data-text="phoneNumberLength()"></h3>



data-visible
------------

Shows or hides an HTML element based upon the value of an instance property or method. Example:

JavaScript model:

    class ExampleModel {
        constructor(){
            this.phone='';
        }
        
        phoneNumberLength(){
            return this.phone.length;
        }
    }
    
HTML

    <label>Phone number: <input data-set="phone"></label>
    <p data-visible="phoneNumberLength()==0">Phone number is required</p>
    <p data-visible="phone.length==0">Phone number is still required</p>

data-options
------------

Provide the options for a SELECT input.  Must return a list of options.  This can either be a simple list of values or a 
list of Objects, with this format: {value: "a", label: "The letter A"}.  Example:

JavaScript model:

    class ExampleModel {
        constructor(){
            this.animals = [{value: 'dog', label: 'Dog'}, {value: 'feline', label: 'Cat'}];
            this.select_value = 'dog';
        }
    }
    
HTML

    <select id="select" data-set="select_value" data-options="animals"> </select>

Methods
=======

The extension Class has a few methods to help out.

    /**
     * update elements on the page after something may have
     * changed
     */
    mutated()
    
Updates the page if you alter properties not using *data-click*, *data-children*, *childrenAdd()* or *childrendClear()*.  
    
    /***
     * Add a child or children to a model list property
     *
     * @param child: a single child or a list of children to add
     * @param childrenProp: (optional, defaults to children) the property to add the children to.
     */
    childrenAdd(child, childrenProp)

Add a child class instance to a view controller property.  By default uses the builtin *children* object.  
Pass a **childrenProp** parameter to use another property.  Lists of children is maintained using the 
child ids as key to properties of an object.

    /***
     * remove all items from a child list property
     * and then refresh the page
     *
     * @param childrenProp
     */
    childrenClear(childrenProp)
    
Removes all items from a child list property.  By default uses the builtin *children* object.  
Pass a **childrenProp** parameter to use another property.

General Operations
==================

Adding children to a list using a JSON ajax response
----------------------------------------------------

    $.ajax('/names').then(results => {
        this.childrenAdd(results.map(r=>new ChildModel(r)));
    }

Removing an item from a list
----------------------------

From an object property.


    clickRemoveChild() {
        this._parent.childrenRemove(this);
    }

Components
==========

view components
---------------

The *data-children* directive can be used to add view components to your page.  A view component is a JavaScript class
that creates it's own HTML on the page.  This done by adding a *create()* method to the class to be used and
to the view model for the page.  Then assign it as a property on the main view model.  The property name
is then used with the *data-children* directive to refer to the view component.

Example:
--------
```html
<div>
    <div data-children="component"></div>
</div>  

```

```javascript

class ComponentModel{
    constructor(greeting){        
        this.greeting = greeting
    }
        
    create(index, parentElement){
        return `<p>${this.greeting}</p>`    
    }
}

class ViewModel extends DeclareMVC {
    constructor(props){
        super(props);
        this.component = new ComponentModel('hello');
    }
}

```
A view component can have it's own click handlers and any properties you want.  It cannot have children.

Independent components
----------------------

You can create components that exist independently from the page view controller.  These can reside
in their own JavaScript files.

Example:

```JavaScript

class ComponentCounter extends DeclareMVC {
    constructor(parentSelector, parent) {
        super(parentSelector, parent);
        this.counter = 0;
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
```

Add them to a page using the *data-component* directive.  The component name is the ClassName of the
component.  Example:

```html
    <table>
        <tbody>
        <tr>
            <td>component 1</td>
            <td data-component="ComponentCounter">
            </td>
        </tr>
        <tr>
            <td>component 2</td>
            <td data-component="ComponentCounter">
            </td>
        </tr>
        </tbody>
    </table>
```
When the component *create* is called it is passed the parent html element and the view model instance.  These
properties can be used by the component to interact with the parent view.
