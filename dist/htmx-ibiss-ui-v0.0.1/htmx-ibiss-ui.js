(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    (function () {
        htmx.defineExtension('ibiss-ui', {
            onEvent: function (eventType, event) {
                if (eventType === 'htmx:beforeRequest') {
                    const { target, detail } = event;

                    const routerFn = target.getAttribute('ibiss-router');

                    if (window[routerFn] && typeof window[routerFn] === 'function') {
                        window[routerFn](target, detail, event);
                        return false; /** this is the only thing that stops the request from happening.*/
                    }
                    /** if the function does not exist, just do original HTMX **/
                }
            },
        });
    })();

}));
