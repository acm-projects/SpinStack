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
      length: 204,
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

export const demoMoments = [demoMoment, demoMoment, demoMoment, demoMoment];

const demoDaily = {
    moment: mom,
    date: 0,
    title: "Cozy Winter Night",
    rating: -1,
}

const demoDaily3 = {
    moment: mom,
    date: 1,
    title: "Peaceful Sunrise",
    rating: -1,
}

const demoDaily4 = {
    moment: mom,
    date: 2,
    title: "Chair Throwing Rage",
    rating: -1,
}

const demoDaily5 = {
    moment: mom,
    date: 3,
    title: "Rainy Walk down an empty street",
    rating: -1,
}

const demoDaily6 = {
    moment: mom,
    date: 4,
    title: "Floating in a blackhole",
    rating: -1,
}

const demoDaily7 = {
    moment: mom,
    date: 5,
    title: "Music to Goon to 👅🍆💦💦💦💦",
    rating: 5,
}

const demoDaily2 = {
    moment: mom,
    date: 6,
    title: "Soul-crushing Heartbreak",
    rating: -1,
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
