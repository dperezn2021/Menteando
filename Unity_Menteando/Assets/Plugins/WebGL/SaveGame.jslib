mergeInto(LibraryManager.library, {
    SaveGameData: function (jsonPtr) {
        const json = UTF8ToString(jsonPtr);

        console.log("JSlib recibió JSON:", json);

        if (typeof window.SaveGameData === "function") {
            window.SaveGameData(json);
        } else {
            console.log("window.SaveGameData NO está definida");
        }
    }
});
