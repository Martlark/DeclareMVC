# DeclareMVC
Tiny ECMAScript 6 class based declarative JavaScript MVC.

DeclareMVC is intended for simple UI usages that extend on basic HTML layouts with ECMAScript 6 classes controlling the page.

It features automatic context assignment so no messing about with *this* or *bind()* is required.  Lightweight, it is 
ideal for adding UI behaviours to existing HTML pages and controllers.  Especially CRUD pages that require handling child
objects.

Supports these declarations:

* data-set
* data-click
* data-repeat
* data-text
* data-visible
* data-options

data-set
--------

Sets an instance property from an input element such as a INPUT, SELECT or TEXTAREA.

data-click
----------

Ties an element to an instance method for doing stuff when clicked.

data-repeat
-----------

Repeats HTML element for each item in a child property.

data-text
---------

Sets the text value of a HTML element from an instance property or method.

data-visible
------------

Shows or hides an HTML elment based upon the value of an instance property or method.

data-options
------------

Provide the options for a SELECT input.

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

DeclareMVC will start automatically once the page has completed loading.  

Declare your page controls that link your view model to the page, as per this example.

    <button data-click="clickButton1()">Add to counter</button>
    <p>counter:<span data-text="counter"></span></p>
    <h5 data-visible="counter>10">Counter is greater than 10</h5>
    <h5 data-visible="counter<10">Counter is less than 10</h5>

There are three data declarations here:

* data-click
* data-text
* data-visible

**data-click** links a view method to a button or clickable item on the page.  NOTE: there is no need to specify *viewModel*, *this* 
or *bind()*.  The correct context for calling the click method is determined by the HTML hierarchy.

**data-text** links a property from the view to a text item on the page.  Whenever the property is changed the 
text for this element will change with it.  Any valid JavaScript that returns a value can be used.

**data-visible** shows or hides HTML based upon a property or method from the view controller.  Whenever the property
changes the visible status will be recalculated.  Any valid JavaScript can be used as long as it returns true or false.

As you can see DeclareMVC automatically handles the context of the view controller for the given HTML element.
