# Ibiss UI HTMX extension
This extension was written to be able to fully control the AJAX calls on the clientside.

# Installation
Just add the ```htmx-ibis-ui.js``` in your html document and add 
```hx-ext="ibiss-ui"``` on an element, for example the ```body``` tag. See [HTMX extension documentation](https://htmx.org/extensions/) for more info.

Then on any element which normally does an AJAX request add the following attribute:
```ibiss-router="yourRouterFunction">```

The name 'yourRouterFunction' should be available on window (which by default it is).

if you do not supply an ibiss-router attribute, htmx will continue to do its ajax request.
you can mix and match freely!

## Example and signature
```
yourRouterFunction(target, detail, event) {
    // target = the target HTML element
    // detail is the HTMX details, where you can find all the info for the request
    // event is the complete event for if you need more detail.

    // do your ajax calls here
    // process it with a templating engine like RocketJS

    /** write response to the element itself with innerHTML or innerTEXT **/
    target.innerHTML = '<p>Updated through the client side router!</p>'
    return;
}
```
