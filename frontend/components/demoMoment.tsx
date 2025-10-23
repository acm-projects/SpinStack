import MomentInfo, { Moment } from "./momentInfo";

const albumImg = require('../assets/images/album.png');
const profileImg = require('../assets/images/profile.png');
const vinylImg = require('../assets/images/vinyl.png')
const prof2 = require('../assets/images/profile2.png');
const prof3 = require('../assets/images/profile3.png');

const mom: Moment = {
      id: '0',
      title: "Like This",
      artist: "Atura",
      songStart: 132.6,
      songDuration: 44.8,
      length: 204,
      album: albumImg,
      waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
    };

  const mom1: Moment = {
    id: "1",
    title: "Golden",
    length: 194,
    songStart: 102,
    songDuration: 20.4,
    artist: "HUNTR/X: EJAE, Audrey Nuna & REI AMI",
    album: require("@/assets/images/album1.jpeg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom2: Moment = {
    id: "2",
    title: "back to friends",
    artist: "sombr",
    length: 199,
    songStart: 119.4,
    songDuration: 19.9,
    album: require("@/assets/images/album2.jpeg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom3: Moment = {
    id: "3",
    title: "Ordinary",
    artist: "Alex Warren",
    length: 186,
    songStart: 37.2,
    songDuration: 18.6,
    album: require("@/assets/images/album3.jpeg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom4: Moment = {
    id: "4",
    title: "Man I Need",
    artist: "Olivia Dean",
    length: 184,
    songStart: 46,
    songDuration: 18.4,
    album: require("@/assets/images/album4.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom5: Moment = {
    id: "5",
    title: "TIT FOR TAT",
    artist: "Tate McRae",
    length: 175,
    songStart: 77,
    songDuration: 19.25,
    album: require("@/assets/images/album5.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom6: Moment = {
    id: "6",
    title: "Don't Say You Love Me",
    length: 180,
    songStart: 36,
    songDuration: 27,
    artist: "Jin",
    album: require("@/assets/images/album6.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom7: Moment = {
    id: "7",
    title: "Soda Pop",
    artist: "Saja Boys: Andrew Choi, Neckwav, Danny Chung, Kevin Woo & samUIL Lee",
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
    length: 150,
    songStart: 45,
    songDuration: 21,
    album: require("@/assets/images/album7.jpg"),
    
  };
  const mom8: Moment = {
    id: "8",
    title: "Die With A Smile",
    length: 224,
    songStart: 134.4,
    songDuration: 22.4,
    artist: "Morgan Wallen Featuring Tate McRae",
    album: require("@/assets/images/album8.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom9: Moment = {
    id: "9",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eillish",
    length: 210,
    songStart: 105,
    songDuration: 21,
    album: require("@/assets/images/album9.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom10: Moment = {
    id: "10",
    title: "Gabriela",
    length: 197,
    songStart: 98.5,
    songDuration: 33.49,
    artist: "KATSEYE",
    album: require("@/assets/images/album10.jpg"),
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

const demoMoment2 = {
    moment: mom1,
    user: helena
}
const demoMoment3 = {
    moment: mom2,
    user: tyler
}
const demoMoment4 = {
    moment: mom3,
    user: annie
}
const demoMoment5 = {
    moment: mom4,
    user: helena
}

export const moms = [mom1, mom2, mom3, mom4, mom5, mom6, mom7, mom8, mom9, mom10];
export const demoMoments: MomentInfo[] = [
    {
        moment: {
            id: "76Oysc8zao2adNBqN3prw9",
            title: "Hacking to the Gate",
            artist: "AmaLee",
            songStart: 10,
            songDuration: 10,
            length: 252,
            album: albumImg,
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
            title: "Paragon",
            artist: "Sawano Hiroyuki",
            songStart: 55,
            songDuration: 35,
            length: 166,
            album: albumImg,
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
            title: "Jeopardy",
            artist: "Sawano Hiroyuki",
            songStart: 30,
            songDuration: 10,
            length: 237,
            album: albumImg,
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
            title: "Inertia",
            artist: "Sawano Hiroyuki",
            songStart: 40,
            songDuration: 10,
            length: 199,
            album: albumImg,
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
    rating: -1,
}

const demoDaily3 = {
    moment: mom1,
    date: 1,
    title: "Peaceful Sunrise",
    rating: -1,
}

const demoDaily4 = {
    moment: mom2,
    date: 2,
    title: "Chair Throwing Rage",
    rating: -1,
}

const demoDaily5 = {
    moment: mom3,
    date: 3,
    title: "Rainy Walk down an empty street",
    rating: -1,
}

const demoDaily6 = {
    moment: mom4,
    date: 4,
    title: "Floating in a blackhole",
    rating: -1,
}

const demoDaily2 = {
    moment: mom6,
    date: 6,
    title: "Soul-crushing Heartbreak",
    rating: 4,
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

export const demoGroups = [demoGroup, demoGroup3, demoGroup4, demoGroup5, demoGroup2, demoGroup6]
