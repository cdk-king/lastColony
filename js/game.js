// Intialize and resize the game once page has fully loaded
window.addEventListener("load", function() {
    //game.resize();
    game.init();
}, false);

// Resize the game any time the window is resized
window.addEventListener("resize", function() {
    //game.resize();
});

var game = {
    //开始预加载资源
    init:function(){
        loader.init();

        // Display the main game menu
        game.hideScreens();
        game.showScreen("gamestartscreen");

    },
    hideScreens: function() {
        var screens = document.getElementsByClassName("gamelayer");
        for (let i = screens.length - 1; i >= 0; i--) {
            var screen = screens[i];
            screen.style.display = "none";
        }
    },
    hideScreen: function(id) {
        var screen = document.getElementById(id);

        screen.style.display = "none";
    },
    showScreen: function(id) {
        var screen = document.getElementById(id);

        screen.style.display = "block";
    },
}