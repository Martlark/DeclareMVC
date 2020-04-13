# DeclareMVC
Tiny ECMAScript 6 class based declarative JavaScript MVC.

DeclareMVC is intended for simple UI usages that extend on basic HTML layouts with ECMAScript 6 classes controlling the page.

It features automatic context assignment so no messing about with *this* or *bind()* is required.  Lightweight, it is 
ideal for adding UI behaviours to existing HTML pages and controllers.  Especially CRUD pages that require handling child
objects.

There is no support for components, extensions or complicated rendering.  Use a templating language such as 
JINJA2 or similar for those uses.  The method for determining page updates is rather simple, any *data-click* or *data-set*
action causes an update event.  When adding to a child list use the *childrenAdd()* method to raise an update event.

Supports these declarations:

* data-set
* data-click
* data-repeat
* data-text
* data-visible
* data-options
* data-attr

Example:
========

Jquery is required.  Include declare_mvc.js as per the example.

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Example DeclareMVC application</title>
        <script
                src="https://code.jquery.com/jquery-3.3.1.min.js"
                integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
                crossorigin="anonymous"></script>
        <script src="static/declare_mvc.js"></script>
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
            <tbody data-repeat="children">
            <tr>
                <td><button data-click="clickRemoveChild()">Remove</button><span data-text="id"></span></td>
                <td data-text="title"></td>
                <td data-text="name"></td>
                <td><input data-set="name"></td>
            </tr>
        </tbody>
    </table>

The HTML uses the *data-repeat* directive to create the <tr> rows of the table.  DeclareMVC will dynamically maintain the
list from the properties of the children.  Here the entire <tr> element will be repeated.  When items are removed the 
corresponding <tr> element will be removed as long as a *data-click* causes the removal, or *childrenClear()* is called.

Details
=======

data-set
--------

Sets an instance property from an input element such as a INPUT, SELECT or TEXTAREA.  Example:

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


data-repeat
-----------

Repeats HTML element for each item in a child property.  Example:

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

    <table data-repeat="children">
        <tr><td data-text="id"></td></tr>
    </table>

RESULTANT HTML:

    <table data-repeat="children">
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
list of Objects, with this format: {value: "a", label: "The letter A"}.
