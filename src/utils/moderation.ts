const BANNED_WORDS = [
    "abuse", "badword", "hate", "violence", "kill", "idiot", "stupid"
    // Add more words as needed
];

export const checkContent = (text: string): { isClean: boolean; reason?: string } => {
    const lowerText = text.toLowerCase();

    for (const word of BANNED_WORDS) {
        if (lowerText.includes(word)) {
            return { isClean: false, reason: `Contains inappropriate word: ${word}` };
        }
    }

    return { isClean: true };
};
