# ng-unsaved-changes

An angular directive to notify the user before leaving a page with unsaved changes in forms.


# usage

```shell
npm i ng-unsaved-changes
# or
bower install ng-unsaved-changes
```

```js
angular.module('myApp', ['io.dennis.unsaved-changes'])
  .run(SetupUnsavedChanges);

SetupUnsavedChanges.$inject = ['UnsavedChangedService'];
function SetupUnsavedChanges($unsavedChanges) {
  $unsavedChanges.setInterceptor(myInterceptor);
  $unsavedChanges.setMessage('You have unsaved changes, really leave?');

  function myInterceptor(confirm) {
    // show your user whatever you want to warn him about leaving a page
    // with unsaved changes. Look at the demo to see an example of how to display
    // a modal with a warning

    // if your user confirms that he want to leave, call confirm ->
    confirm();
  }
}
```

```html
<form ng-unsaved-changes>
  <!-- ... --->
</form>
```

Currently only works for forms!


# license

MIT

