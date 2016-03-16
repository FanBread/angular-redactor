(function() {
    'use strict';

    /**
     * usage: <textarea ng-model="content" redactor></textarea>
     *
     *    additional options:
     *      redactor: hash (pass in a redactor options hash)
     *
     */

    var redactorOptions = {};

    angular.module('angular-redactor', [])
        .constant('redactorOptions', redactorOptions)
        .directive('redactor', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {

                    // Expose scope var with loaded state of Redactor
                    scope.redactorLoaded = false;

                    var updateModel = function updateModel(value) {
                            // $timeout to avoid $digest collision
                            $timeout(function() {
                                scope.$apply(function() {
                                    ngModel.$setViewValue(value);
                                });
                            });
                        },
                        options = {},
                        defaultCallbacks = {
                            change: updateModel
                        },
                        additionalOptions = attrs.redactor ?
                            scope.$eval(attrs.redactor) : {},
                        editor;

                    angular.extend(options, redactorOptions, additionalOptions);

                    // prevent collision with the constant values on callbacks.change
                    var callbacks = additionalOptions.callbacks || redactorOptions.callbacks;
                    if (callbacks) {
                        if(callbacks.change) {
                            options = {
                                callbacks: {
                                  change: function(value) {
                                      updateModel.call(this, value);
                                      callbacks.change.call(this, value);
                                  }
                                }
                            }
                        }
                        angular.extend(options.callbacks, defaultCallbacks, redactorOptions.callbacks, additionalOptions.callbacks);
                    }

                    // put in timeout to avoid $digest collision.  call render() to
                    // set the initial value.
                    $timeout(function() {
                        editor = element.redactor(options);
                        ngModel.$render();
                        element.on('remove',function(){
                            element.off('remove');
                            element.redactor('core.destroy');
                        });
                    });

                    ngModel.$render = function() {
                        if(angular.isDefined(editor)) {
                            $timeout(function() {
                                element.redactor('code.set', ngModel.$viewValue || '');
                                element.redactor('placeholder.hide');
                                scope.redactorLoaded = true;
                            });
                        }
                    };
                }
            };
        }]);
})();

