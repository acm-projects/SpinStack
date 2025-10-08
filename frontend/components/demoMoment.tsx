const albumImg = require('../assets/images/album.png');
const vinylImg = require('../assets/images/vinyl.png');
const profileImg = require('../assets/images/profile.png');
const prof2 = require('../assets/images/profile2.png');
const prof3 = require('../assets/images/profile3.png');

const mom = {
      songName: "Like This",
      artist: "Atura",
      start: 0.65,
      end: 0.87,
      length: 6767,
      album: albumImg,
      vinyl: vinylImg,
      waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
    };

const helena = {
      name: "Helena Vance",
      profilePic: profileImg,
    };

const tyler = {
    name: "Tyler Robinson",
    profilePic: prof2
}

const annie = {
    name: "Annie Edison",
    profilePic: prof3
}

export const demoMoment = {
    moment: mom,
    user: helena
};

export const demoMoments = [
    {
        moment: {
            id: "76Oysc8zao2adNBqN3prw9",
            songName: "Like This",
            artist: "Atura",
            songStart: 10,
            songDuration: 10,
            start: 0.1,
            end: 0.5,
            length: 6767,
            album: albumImg,
            vinyl: vinylImg,
            waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
        },
        user: {
            name: "John Doe",
            profilePic: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg"
        }
    },
    {
        moment: {
            id: "5XbhCs9IBWBRJwsJoU3BeD",
            songName: "Let It Happen",
            artist: "Tame Impala",
            songStart: 20,
            songDuration: 20,
            start: 0.65,
            end: 0.87,
            length: 6767,
            album: albumImg,
            vinyl: vinylImg,
            waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
        },
        user: {
            name: "John Doe",
            profilePic: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg"
        }
    },
    {
        moment: {
            id: "6oMWSgvctf10gC6DxS75Al",
            songName: "Headlock",
            artist: "Imogen Heap",
            songStart: 30,
            songDuration: 10,
            start: 0.65,
            end: 0.87,
            length: 6767,
            album: albumImg,
            vinyl: vinylImg,
            waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
        },
        user: {
            name: "John Doe",
            profilePic: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg"
        }
    },
    {
        moment: {
            id: "2joT0CjcGqc1fr8Fvk7itj",
            songName: "Cigarettes out the Window",
            artist: "TV Girl",
            songStart: 40,
            songDuration: 10,
            start: 0.65,
            end: 0.87,
            length: 6767,
            album: albumImg,
            vinyl: vinylImg,
            waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
        },
        user: {
            name: "John Doe",
            profilePic: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg"
        }
    }
];

const demoDaily = {
    moment: mom,
    date: 0,
    title: "Cozy Winter Night",
    rating: 5,
}

const demoDaily3 = {
    moment: mom,
    date: 2,
    title: "Peaceful Sunrise",
}

const demoDaily4 = {
    moment: mom,
    date: 3,
    title: "Chair Throwing Rage",
}

const demoDaily5 = {
    moment: mom,
    date: 4,
    title: "Rainy Walk down an empty street"
}

const demoDaily6 = {
    moment: mom,
    date: 5,
    title: "Floating in a blackhole"
}

const demoDaily7 = {
    moment: mom,
    date: 6,
    title: "Music to Goon to 👅🍆💦💦💦💦"
}

const demoDaily2 = {
    moment: mom,
    date: 1,
    title: "Soul-crushing Heartbreak",
    rating: 5,
}

export const demoGroup = {
    name: "Cool Gang",
    users: [annie, tyler],
    dailies: [demoDaily]
}

const demoGroup2 = {
    name: "Squirtle Squad",
    users: [helena, annie, tyler],
    dailies: [demoDaily2],
}

const demoGroup3 = {
    name: "Ducklings",
    users: [annie, tyler],
    dailies: [demoDaily3]
}

const demoGroup4 = {
    name: "Little Guys",
    users: [annie, tyler],
    dailies: [demoDaily4]
}

const demoGroup5 = {
    name: "CompSci Majors",
    users: [helena, annie, tyler],
    dailies: [demoDaily5]
}

const demoGroup6 = {
    name: "Mohammad's Kittens",
    users: [helena, annie, tyler],
    dailies: [demoDaily6]
}

const demoGroup7 = {
    name: "Goon Cave",
    users: [helena, annie, tyler],
    dailies: [demoDaily7]
}

export const demoGroups = [demoGroup, demoGroup3, demoGroup4, demoGroup5, demoGroup2, demoGroup6, demoGroup7]
