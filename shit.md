# Small JQuery rant

Let's dissect this 60 line IIFE little by little.

First, what will "\$" be within this context.
$ is a JQuery alias, it just calls a JQuery function.

It is important to note that it is common to not strictly use the $ alias in development, because many other frameworks may use $ as an alias themselves.

And so, a lot of this 60 line piece of ass revolves around a method of using the reference to JQuery being "window.jQuery" instead of $ itself, while still calling JQuery functions via $ syntax.

JQuery is a weird motherfucker. It's old and a lot of people will use some parts of it as an extension of base JS, complementing it with JS itself and forgoeing its entire toolkit.

Crucially, JQuery *loads* into a page, because it's not part of your browser, so whatever code that executes needs JQuery to be loaded, this is important in a mo', trust.

Let me go through the whole function, which is a better example of why I'm developing a headache.

This function specifically is an IIFE, which is jargon for "a piece of code that executes whenever the file is loaded", "Immediately Invoked Function Expression"

```js
(function(CyTube_Layout) {
    return CyTube_Layout(window, document, window.jQuery, String)
}) (function(window, document, $, String, undefined) {[...]})
```

This is a whole lot to encompass, even for developers, because javascript is its own world and you feed it separately, much like you do with Python.

I assume you know how a regular named function is called, but to refresh your mind it looks something like this

```js
//this DEFINES the function
function functionName() {
  return "this is a function"
}
//this CALLS the function
functionName()
```

Specifically, the snippet above has an inner and outer function.
Quick explanation, an IIFE can be called as such:

```js
(function() {return "hi"})();
```

It can also be called with the arrow syntax, which you might have seen more often and I personally prefer.

```js
(() => {return "hi"})();
```

These are one of the most used and abused javascript functionalities.
Additionally, you can have them have parameters.

See the last `()` in both IIFE? That's the equivalent of calling our original `functionName()`, but since they're anonymous... well, they're anonymous, they don't have a name.

Following that line of logic, you can now see how you can add parameters to the anonymous function.

If a normal function with parameters looks like so:

```js
function functionName(param) {
  return param
}
functionName("hi")
```

An anonymous function with parameters looks like so:

```js
//Looks quite ugly
(function(param) { 
  return param
}) ("hi")

//The parameter, which is key information for the function, gets pushed to the right, and is possibly unreadable without scrolling. In both cases, you lose a lot of readability.
(function(param) { return param }) ("hi")  

//A bit better
((param) => {
  return param
}) ("hi")

//Same exact issue
(param) => { return param } ("hi")
```

So let me bring back the original culprit function:

```js
(function(CyTube_Layout) {
    return CyTube_Layout(window, document, window.jQuery, String)
}) (function(window, document, $, String, undefined) {[...]})
```

Now we know that this is an anonymous function that takes a parameter `CyTube_Layout`. Since JavaScript is a dynamically typed language, this "CyTube_Layout" could be called "banana" instead.

And so we reach the meat.

## Issue #1, nomenclature and window.jQuery

The main reason why you would call this parameter something so horribly specific is if your code included an object structure for something like this.

This parameter is, however, a function!. This IIFE is returning a function, which immediately gets executed.

Let me remove every single argument from the function except for the window.jQuery, no reason for that other than to keep it concise.

```js
(function(CyTube_Layout) {
    return CyTube_Layout(window.jQuery)
}) (function($) {[...]})
```

Do you see something weird?

While this will work, it is doing the following:

* Declare an anonymous function to be immediately executed
* Declare its parameters as a function themselves
* Call the IIFE (line 3).
* The IIFE is, itself, a function which takes parameters.

And so its syntax goes something like

```js
((param) {
  return (value)
}) ((param2) {execution})
```

Needless to say this nesting is unnecessary, even by code practices of when this was written.

This is for two reasons, the first is that it goes against any conventional method of reading a function.

Going back to the above examples, you can read that an IIFE would be read as such:

```js
((param) => {execution}) (value) 
```

The other is that the naming **strongly suggests** that there's a strong reasoning for this, like an object of type CyTube_Layout that holds onto this information and can be swapped.

And even if this were the case, this is **not** the way to do this. Modules, prototypes and other more readable methods have existed since before this was written.

And so, it can safely be rewritten as such:

```js
(($) => {
  //Execution
}) (window.jQuery);
```

BUT HOLD IT! I hear the voices in my head ask. If this is the case, then the arguments, which are very important information that need to be read soon have to be read at the bottom!

Yes, kinda.

While it's still a much better, more concise, and most importantly *consistent* way of doing things, there are still better ways of rewriting this. Most crucial would be modularization and exporting of functions.

There are still a few elephants in the room. If "$" is supposed to be an alias to window.jQuery, why is it being passed as a parameter?

Long story short, this is to avoid malicious people like Kusa injecting or passing a new value to the alias "$" thus making evil things possible. Or alternatively, other frameworks wanting to use $.

window.jQuery is a very reliable method of avoiding that type of injection, as well as explicitly declaring to the reader that it's a jQuery set of instructions.

I'm sure that the original developer for this implementation found some error relevant to $ being overwritten and thus wrote it like that, but just in case, here's how you would write this function if you were sure that you only used jQuery, or that nothing would overwrite its alias.

```js
$(function() {
  //execution
})
```

Simple, right? And there are many other ways, that you can read here, which are all a hundred times more readable than an IIFE that invokes an IIFE, and still check all the same boxes for injection.

<https://api.jquery.com/jQuery.noConflict/>

> Alright, then rewrite the whole function, let's see it!

rucially, `window, document, String`, *are not used within the IIFE*, and then you have an undefined cause why not.

` if !$().length ` is the encompasing condition, it will be checking for the length of whatever is inside the $(), so this $() has to have a .length attribute, this is, so far, alright.

`'a[onclick*...` finds
