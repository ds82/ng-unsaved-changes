'use strict';
require('babel/polyfill');

angular.module('io.dennis.unsaved-changes', [])
  .service('UnsavedChangedService', UnsavedChangedService)
  .directive('unsavedChanges', UnsavedChanges);
;

UnsavedChangedService.$inject = ['$window', '$rootScope'];
function UnsavedChangedService($window, $rootScope) {
  var self = this;

  var dirtySuspects = [];
  var interceptor = function() {};
  var leaveMessage = '';

  // TODO make configurable
  var listenTo = [
    '$locationChangeStart',     // default angular event
    '$stateChangeStart',        // ui-router event
  ];

  self.register = register;
  self.unregister = unregister;
  self.setInterceptor = setInterceptor;
  self.setMessage = setMessage;

  $window.onbeforeunload = beforeUnload;
  $window.addEventListener('beforeunload', beforeUnload);
  listenTo.forEach(eventName => $rootScope.$on(eventName, onLocationChange));

  function register(who, isDirty) {
    dirtySuspects.push({who: who, isDirty: isDirty});
  }

  function unregister(who) {
    var removeIndex = dirtySuspects.indexOf(who);
    if (removeIndex > -1) {
      dirtySuspects.splice(removeIndex, 1);
    }
  }

  function setInterceptor(fn) {
    interceptor = fn;
  }

  function setMessage(msg) {
    leaveMessage = msg;
  }

  function hasUnsavedChanges() {
    console.log('hasUnsavedChanges?', !!dirtySuspects.find(suspect => suspect.isDirty()));
    return !!dirtySuspects.find(suspect => suspect.isDirty());
  }

  function beforeUnload() {
    if (hasUnsavedChanges()) {
      return leaveMessage;
    }
  }

  function onLocationChange(ev, next) {
    console.log('onLocationChange', ev);
    if (hasUnsavedChanges()) {
      ev.preventDefault();
      interceptor(next);
      return false;
    }
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
      $service.register(iAm, () => formCtrl.$dirty);
    } else {
      // TODO
    }

    scope.$on('$destroy', () => $service.unregister(iAm));
  }
}
