'use strict';

angular.module('io.dennis.unsaved-changes', [])
  .service('UnsavedChangedService', UnsavedChangedService)
  .directive('unsavedChanges', UnsavedChanges);
;

UnsavedChangedService.$inject = ['$injector', '$window', '$rootScope', '$location'];
function UnsavedChangedService($injector, $window, $rootScope, $location) {
  var self = this;

  var dirtySuspects = new Map();
  var interceptor = function() {};
  var leaveMessage = undefined;

  // stub state service in case ui-router is not there
  var $state = {go: function() {}};
  try {
    $state = $injector.get('$state');
  } catch (e) {}

  self.register = register;
  self.unregister = unregister;
  self.setInterceptor = setInterceptor;
  self.setMessage = setMessage;


  //
  // register $locationChangeStart
  //
  $rootScope.$on('$locationChangeStart', onLocationChange);

  //
  // register $stateChangeStart (ui-router)
  //
  $rootScope.$on('$stateChangeStart', onStateChange);

  function register(who, suspect) {
    dirtySuspects.set(who, suspect);
  }

  function unregister(who) {
    dirtySuspects.delete(who);
  }

  function setInterceptor(fn) {
    interceptor = fn;
  }

  function setMessage(msg) {
    leaveMessage = msg;
    if (msg) { hookOnBeforeUnload(); }
  }

  function hookOnBeforeUnload() {
    $window.onbeforeunload = beforeUnload;
    $window.addEventListener('beforeunload', beforeUnload);
  }

  function hasUnsavedChanges() {
    return !!Array.find([...dirtySuspects], ([,suspect]) => suspect.isDirty());
  }

  function beforeUnload() {
    if (hasUnsavedChanges()) {
      return leaveMessage;
    }
  }

  function onLocationChange(ev, newUrl) {
    if (hasUnsavedChanges()) {
      ev.preventDefault();
      let path = getAngularPath(newUrl);
      confirmLocationChange(() => $location.path(path));
      return false;
    }
  }

  function onStateChange(ev, nextState, params) {
    if (hasUnsavedChanges()) {
      ev.preventDefault();
      confirmLocationChange(() => $state.go(nextState, params));
      return false;
    }
  }

  function confirmLocationChange(next) {
    interceptor(() => {
      for (let [,suspect] of dirtySuspects) {
        suspect.setPristine();
      }
      next();
    });
  }

  function getAngularPath(fullUrl) {
    var anchor = $window.document.createElement('a');
    anchor.setAttribute('href', fullUrl);
    return anchor.hash.substring(1);
  }
}

UnsavedChanges.$inject = ['UnsavedChangedService'];
function UnsavedChanges($service) {
  return {
    restrict: 'A',
    scope: false,
    link: link
  };

  function link(scope, element) {
    var tag = String(element[0].tagName).toLowerCase();
    var iAm = `${tag}-${scope.$id}`;

    if (tag === 'form') {
      var formCtrl = element.controller('form');
      $service.register(iAm, {
        isDirty: () => formCtrl.$dirty,
        setPristine: () => formCtrl.$setPristine()
      });
    } else {
      // TODO
    }

    scope.$on('$destroy', () => $service.unregister(iAm));
  }
}
