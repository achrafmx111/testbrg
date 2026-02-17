export const playSuccessSound = () => {
    const audio = new Audio("https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3"); // Generic success chime
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed (interaction required)", e));
};

export const playCaChingSound = () => {
    const audio = new Audio("https://www.myinstants.com/media/sounds/ka-ching.mp3"); // Classic Cha-ching
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play failed", e));
};

export const playClickSound = () => {
    // Subtle click for interactions
    const audio = new Audio("https://cdn.pixabay.com/audio/2023/11/13/audio_6861d80894.mp3");
    audio.volume = 0.1;
    audio.play().catch(() => { });
};
