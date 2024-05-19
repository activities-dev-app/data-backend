import bcrypt from "bcrypt";

const saltRounds = 12;

const hash = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

const check = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

export const passwordStore = { hash, check };


const benchmark = () => {
    const mypass = "abc123!@#";
    //console.log((new TextEncoder().encode(mypass)).length);


    const start = (new Date()).getTime();

    bcrypt.hash(mypass, saltRounds).then(hash => {
        const finish = (new Date()).getTime();
        //console.log(hash, finish - start);
    });
};
