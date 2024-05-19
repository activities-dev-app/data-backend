const charsList = [];

for (let i=48; i<=57; i++) {
    charsList.push(String.fromCharCode(i));
}

for (let i=65; i<=90; i++) {
    charsList.push(String.fromCharCode(i));
}

for (let i=97; i<=122; i++) {
    charsList.push(String.fromCharCode(i));
}


export const generateCookie = (length = 10) => {
    let j = 0;
    let cookieString = "";
    const index = () => (Math.random() * (charsList.length - 1)).toFixed(0);
    do {
        const newChar = charsList[index()];
        cookieString += newChar;
        j++;
    } while (j < length);
    return cookieString;
};
