/*globals define*/
define(function(require, exports, module) {
    
    var Lightbox          = require('famous/views/Lightbox');
    var Transform       = require('famous/core/Transform');
    var Easing          = require('famous/transitions/Easing');
    var Timer          = require('famous/utilities/Timer');

    var SpringTransition = require('famous/transitions/SpringTransition');
    var Transitionable   = require('famous/transitions/Transitionable');
    Transitionable.registerMethod('spring', SpringTransition);

    var Utils = require('utils');
    var _ = require('underscore');

    var AppHistory = require('history');

    module.exports = function(App){

        var RouterContext = this;

        // Replacing history events

        App.history = AppHistory(App);

        var stateHistory = [];
        var DefaultRouter = Backbone.Router.extend({

            routes: {

                '' : function(){
                    console.info('homeAlso');
                    if(App.history.data.length == 0){
                        window.location = window.location.href.split('#')[0];
                        App.history.navigate(App.Credentials.home_route);
                    }
                },
                'random(:anynumber)' : function(){
                    if(App.history.data.length == 0){
                        window.location = window.location.href.split('#')[0];
                        // App.history.navigate('dash');
                    }
                },

                'logout(/:force)' : function(){
                    
                    if(arguments[0] === 'force'){
                        App.DeviceReady.ready.then(function(){
                            Utils.logout();
                        });
                        return;
                    }

                    Utils.Popover.Buttons({
                        title: 'Are you sure?',
                        buttons: [
                            {
                                text: 'No',
                                value: 'no'
                            },
                            {
                                text: 'Yes, Logout',
                                value: 'logout',
                                success: function(){

                                    // Unregister from Push Notifications
                                    // - do this before exiting
                                    App.DeviceReady.ready.then(function(){
                                        Utils.logout();
                                    });

                                }
                            }
                        ]
                    });

                },

                'welcome/fullname' : function(){
                    defaultRoute('WelcomeUsername', 'User/WelcomeFullname', arguments, {cache: false});
                },

                'welcome/username' : function(){
                    defaultRoute('WelcomeUsername', 'User/WelcomeUsername', arguments, {cache: false});
                },

                'welcome' : function(){
                    defaultRoute('Welcome', 'User/Welcome', arguments, {cache: false});
                },

                'popover/buttons' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    // defaultRoute('OptionModal', 'Misc/OptionModal', arguments, {cache: false});
                    App.Flags.InPopover = true;
                    App.history.navigate('random' + Utils.randomInt(0,10000), {history: false});
                    defaultRoute('PopoverButtons', 'Misc/PopoverButtons', arguments, {cache: false, popover: true});
                },

                'popover/help' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    // defaultRoute('OptionModal', 'Misc/OptionModal', arguments, {cache: false});
                    App.Flags.InPopover = true;
                    App.history.navigate('random' + Utils.randomInt(0,10000), {history: false});
                    defaultRoute('PopoverHelp', 'Misc/PopoverHelp', arguments, {cache: false, popover: true});
                },

                'popover/alert' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    // defaultRoute('OptionModal', 'Misc/OptionModal', arguments, {cache: false});
                    App.Flags.InPopover = true;
                    App.history.navigate('random' + Utils.randomInt(0,10000), {history: false});
                    defaultRoute('PopoverAlert', 'Misc/PopoverAlert', arguments, {cache: false, popover: true});
                },

                'popover/prompt' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    // defaultRoute('OptionModal', 'Misc/OptionModal', arguments, {cache: false});
                    App.Flags.InPopover = true;
                    App.history.navigate('random' + Utils.randomInt(0,10000), {history: false});
                    defaultRoute('PopoverPrompt', 'Misc/PopoverPrompt', arguments, {cache: false, popover: true});
                },

                'popover/list' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    // defaultRoute('OptionModal', 'Misc/OptionModal', arguments, {cache: false});
                    App.Flags.InPopover = true;
                    App.history.navigate('random' + Utils.randomInt(0,10000), {history: false});
                    defaultRoute('PopoverList', 'Misc/PopoverList', arguments, {cache: false, popover: true});
                },

                'misc/help' : function(){
                    defaultRoute('MiscHelp', 'Misc/HelpStatic', arguments, {cache: false});
                },

                'landing' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    Timer.setTimeout(function(){
                        App.Views.SplashLoading.hide();
                    },3000);
                    defaultRoute('Landing', 'Misc/Landing', arguments, {cache: false});
                },

                'login' : function(){
                    // eh, I should be able to cache this route before login, then destroy after login
                    defaultRoute('Login', 'User/Login', arguments, {cache: false});
                },

                'signup' : function(){
                    defaultRoute('Signup', 'User/Signup', arguments, {cache: false});
                },

                'forgot' : function(){
                    defaultRoute('Forgot', 'User/Forgot', arguments, {cache: false});
                },

                'settings/push': function(){

                    Timer.setTimeout(function(){
                        App.Views.SplashLoading.hide();
                    },3000);

                    defaultRoute('PushDefault', 'Misc/PushDefault', arguments);
                },

                'settings': function(){
                    defaultRoute('Settings', 'Misc/Settings', arguments);
                },

                'feedback(/:indicator)': function(){
                    defaultRoute('Feedback', 'Misc/Feedback', arguments);
                },

                'booth/list' : function(){
                    App.Views.MainFooter.route_show = true;
                    App.Views.MainFooter.Tabs.select('booths', false);
                    defaultRoute('Booth', 'Booth/List', arguments);
                },

                'party/list' : function(){
                    App.Views.MainFooter.route_show = true;
                    App.Views.MainFooter.Tabs.select('parties', false);
                    defaultRoute('Party', 'Party/List', arguments);
                },

                'speaker/list' : function(){
                    App.Views.MainFooter.route_show = true;
                    App.Views.MainFooter.Tabs.select('speakers', false);
                    defaultRoute('Speaker', 'Speaker/List', arguments);
                },

                'tips/list' : function(){
                    App.Views.MainFooter.route_show = true;
                    App.Views.MainFooter.Tabs.select('tips', false);
                    defaultRoute('Tips', 'Tips/List', arguments);
                },



            }
        });


        // Handle special transitions if the View->View conditions match
        var ViewToView = {

            // Potentially request data from the PageView here, or tell it how to render in/out
            // - we might simply emit events like "Hey, you're about to get shown" and "here is how long you have to do stuff before you're removed via the Lightbox"

            // specific: View-View
            // mid: X -> *
            // low: * -> X

            '* -> Login' : function(){
                return StoredTransitions.OpacityIn;
            },

            'Login -> *' : function(){
                return StoredTransitions.SlideDown;
            },

            'Login -> Signup' : function(){
                return StoredTransitions.SlideLeft;
            },

            'Signup -> Login' : function(){
                return StoredTransitions.SlideRight;
            },


            'Login -> Forgot' : function(){
                return StoredTransitions.SlideLeft;
            },

            'Forgot -> Login' : function(){
                return StoredTransitions.SlideRight;
            }

        };

        var StoredTransitions = {

            Identity: {
                inOpacity: 1,
                outOpacity: 1,
                inTransform: Transform.identity,
                outTransform: Transform.identity,
                inTransition: { duration: 250, curve: Easing.easeIn },
                outTransition: { duration: 250, curve: Easing.easeIn },
            },

            OpacityIn: {
                inOpacity: 0,
                outOpacity: 0,
                inTransform: Transform.identity,
                outTransform: Transform.identity,
                inTransition: { duration: 250, curve: Easing.easeIn },
                outTransition: { duration: 250, curve: Easing.easeOut }
            },

            HideOutgoingSpringIn: {
                inOpacity: 0,
                outOpacity: 0,
                inTransform: Transform.scale(0,-0.1, 0), //Transform.translate(window.innerWidth,0,0),
                outTransform: Transform.translate(0, 0, 1),
                inTransition: { method: 'spring', period: 500, dampingRatio: 0.6 },
                outTransition: { duration: 300, curve: Easing.easeOut }
            },

            SlideDown: {
                inOpacity: 1,
                outOpacity: 1,
                inTransform: Transform.identity, //Transform.translate(0,window.innerHeight * -1,0),
                outTransform: Transform.translate(0,window.innerHeight,0),
                inTransition: { duration: 250},
                outTransition: { duration: 250},
                overlap: true
            },

            SlideUp: {
                inOpacity: 1,
                outOpacity: 1,
                inTransform: Transform.translate(0,window.innerHeight,0),
                outTransform: Transform.identity, //Transform.translate(0,window.innerHeight * -1,0),
                inTransition: { duration: 250},
                outTransition: { duration: 250},
                overlap: true
            },

            SlideLeft: {
                inOpacity: 1,
                outOpacity: 1,
                inTransform: Transform.translate(window.innerWidth,0,0),
                outTransform: Transform.translate(window.innerWidth * -1,0,0),
                inTransition: { duration: 200, curve: Easing.easeIn },
                outTransition: { duration: 200, curve: Easing.easeIn },
                overlap: true
            },

            SlideRight: {
                inOpacity: 1,
                outOpacity: 1,
                inTransform: Transform.translate(window.innerWidth * -1,0,0),
                outTransform: Transform.translate(window.innerWidth,0,0),
                inTransition: { duration: 250, curve: Easing.easeIn },
                outTransition: { duration: 250, curve: Easing.easeIn },
                overlap: true
            }
        };

        var defaultRoute = function(viewName, viewPath, args, options){
            // Get view based on hash fragment
            // - return cached item

            Utils.Analytics.trackRoute(window.location.hash);

            options = options ? options : {};
            if(args === undefined){
                args = viewPath;
                viewPath = viewName;
            }

            console.log('viewPath:', viewPath);

            // Require at runtime
            require(['views/' + viewPath], function(LoadedView){
    
                // Used for a 350ms delay if we are just loading the new View for the first time
                var delayShowing = 0;
                
                var PageView = App.Router.Cache.get();

                var cachePath = window.location.hash;

                if(PageView === false || options.cache === false){
                    // create it! 
                    // - first time creating it
                    PageView = new LoadedView({
                        args: args,
                        App: App
                    });

                    // Only a pass-through?
                    // - don't even bother showing it!
                    if(PageView.doNotShow){
                        // useful for Wizards
                        console.info('Do Not Show - Page (passthrough)');
                        return;
                    }
                    
                    // Cache it
                    App.Router.Cache.set(PageView, cachePath);

                    delayShowing = 100;
                } else {
                    // Already cached, use the cached version
                }

                // Popover?
                if(options.popover === true){
                    PageView.inOutTransitionPopover('showing');
                    App.Views.Popover.CurrentPopover = PageView;
                    App.Views.Popover.show(PageView);
                    return;
                }
                App.Views.Popover.CurrentPopover = false; // No popover right now!
                
                // Cache pageview
                App.Views.currentPageView = PageView;
                App.Cache.currentPageViewPath = cachePath.substr(1);;

                // Switch to it
                // - if going backwards, do something interesting?
                // - maybe a View could define if it is going to a View of type "car" then it would do a different animation?
                // console.log(PageView);
                // console.log(PageView.inTransform);
                // console.log(PageView.outTransform);

                // Set lightbox back to it's defaults
                // - specifically, the curve fucked stuff up!
                App.MainController.resetOptions();
                var transitionOptions = {};

                // Setting using default options
                console.log('Animating using Default SlideLeft');
                transitionOptions = StoredTransitions.SlideLeft;

                // See if we're going back a page
                // - use a Default "back" animation SlideRight
                var goingBack = false;
                if(App.history.isGoingBack){
                    goingBack = true;
                    App.history.isGoingBack = false; // reset

                    console.log('Animating using BACK');
                    // App.MainController.resetOptions();
                    transitionOptions = StoredTransitions.SlideRight;
                }


                // var l = stateHistory.length,
                //     state = window.location.hash;
                // if (l > 1){
                //     // stateHistory.push(window.location.hash);
                //     console.log(state, ':', stateHistory[l-2]);
                //     if (state === stateHistory[l - 2]) {
                //         // returning to the previous page actually (so use a "back" animation)
                //         stateHistory.pop();
                //         console.log('Animating using BACK');
                //         // App.MainController.resetOptions();
                //         transitionOptions = StoredTransitions.SlideRight;
                //         goingBack = true;
                //     } else {
                //         stateHistory.push(state);
                //     }
                // } else {
                //     stateHistory.push(state);
                // }
                

                App.Cache.LastViewName = App.Cache.LastViewName === undefined ? "" : App.Cache.LastViewName;
                var exactMatchView = App.Cache.LastViewName + ' -> ' + viewName, // highest priority
                    toAnyView = App.Cache.LastViewName + ' -> *', 
                    fromAnyView = '* -> ' + viewName; // lowest priority

                // Extract out multiple key values
                // - todo, would allow: "* -> Login, Home -> Login" for the occurrences
                // - could also add an "!important" flag?

                // Check broastest->specific ViewToView transitions
                if(ViewToView[exactMatchView]){
                    // Most specific match
                    console.log('ViewToView Match: Specific:', exactMatchView);
                    transitionOptions = ViewToView[exactMatchView]();
                } else if(ViewToView[toAnyView]){
                    // mid
                    console.log('ViewToView Match: ToAny:', toAnyView);
                    transitionOptions = ViewToView[toAnyView]();
                } else if(ViewToView[fromAnyView]){
                    // low
                    console.log('ViewToView Match: FromAny:', fromAnyView);
                    transitionOptions = ViewToView[fromAnyView]();
                }

                // Lastly, send the selected "options" to the incoming and outgoing views
                // - each View should receive

                // takes in the direction it is going (in/out) and returns an options to set (which we compare against)
                // - views are assuming that we're doing a "show" immediately following this, no promises
                // - also serves as a trigger for the view that they are doing something

                // todo:
                // - FIX TO INCLUDE THE DELAY!!!

                // tell "hiding" first
                if(App.MainController.lastView && App.MainController.lastView.inOutTransition){
                    transitionOptions = App.MainController.lastView.inOutTransition('hiding', viewName, transitionOptions, delayShowing, PageView, goingBack);
                }
                // tell "showing" next
                if(PageView.inOutTransition){
                    transitionOptions = PageView.inOutTransition('showing', App.Cache.LastViewName, transitionOptions, delayShowing, App.MainController.lastView, goingBack);
                }

                // App.MainController.resetOptions();
                App.MainController.setOptions(transitionOptions);

                // Lightbox now shows the correct PageView
                // - setOptions already called, potentially multiple times!
                App.MainController.lastView = PageView;

                // Delay displaying for a moment, if we just created this View for the first time
                // - expecting it to need a second to load, or something
                Timer.setTimeout(function(){
                    App.MainController.show(PageView);
                }, delayShowing);   
                // console.log('delayshowing: ', delayShowing);

                // Update LastViewName
                App.Cache.LastViewName = '' + viewName;

                // Footer updates
                if(App.Views.MainFooter){
                    if(App.Views.MainFooter.route_show === true){
                        App.Views.MainFooter.show();
                    } else {
                        App.Views.MainFooter.hide();
                    }
                    App.Views.MainFooter.route_show = false;
                }

            });

        };

        return {

            DefaultRouter: DefaultRouter,

            Cache : {
                get: function(options){
                    var hash = window.location.hash;
                        // current_view = App.Cache.Routes[hash]; 

                    if(!App.Cache.RoutesByHash){
                        App.Cache.RoutesByHash = {};
                    }
                    options = options || {}; // better way to do this is (options || options = {}) or similar
                    // options = $.extend({
                    //     render: true
                    // }, options);

                    // Cached View?
                    if(App.Cache.RoutesByHash[hash] != undefined){
                        return App.Cache.RoutesByHash[hash];
                    }

                    return false;
                },
                set: function(view, hash){// Returns a cached view for this route
                    hash = hash || window.location.hash;
                    console.log('set hash:', hash);
                    App.Cache.RoutesByHash[hash] = view;
                    // view.isCachedView = true;
                    return view;
                }
            }

        };

    };

});
