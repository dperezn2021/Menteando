const avatarGrid = document.getElementById("avatar-grid");

const avataresDisponibles = [
    "../assets/avatars/1.png",
    "../assets/avatars/2.png",
    "../assets/avatars/3.png",
    "../assets/avatars/4.png",
    "../assets/avatars/5.png",
    "../assets/avatars/6.png",
    "../assets/avatars/7.png",
    "../assets/avatars/8.png",
    "../assets/avatars/10.png",  
];

function cargarAvatares() {
    avatarGrid.innerHTML = "";

    avataresDisponibles.forEach((src, i) => {
        const div = document.createElement("div");
        div.className = "cursor-pointer rounded-full overflow-hidden border-4 border-transparent hover:border-blue-500 transition";

        div.innerHTML = `<img src="${src}" class="w-full h-full object-cover" />`;

        div.addEventListener("click", () => seleccionarAvatar(src));

        avatarGrid.appendChild(div);
    });
}

function seleccionarAvatar(src) {
    const perfil = getperfil();
    perfil.avatar = src;
    saveperfil(perfil);

    document.getElementById("perfil-avatar").src = src;

    const headerAvatar = document.getElementById("perfil-avatar-header");
    if (headerAvatar) headerAvatar.src = src;

    cargarAvatares();
    cerrarModal();
}

function cerrarModal() {
    const modalAvatar = document.getElementById("modal-avatar");
    if (modalAvatar) modalAvatar.classList.add("hidden");
}
