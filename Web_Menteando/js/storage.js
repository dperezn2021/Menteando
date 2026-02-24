window.SaveGameData = function(data) {
    console.log("JSON recibido desde Unity:", data);

    const session = JSON.parse(data);

    let results = JSON.parse(localStorage.getItem("gameResults") || "[]");
    results.push(session);
    localStorage.setItem("gameResults", JSON.stringify(results));   

    updateGlobalProfile(session);
};
