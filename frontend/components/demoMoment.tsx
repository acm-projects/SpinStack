const albumImg = require('../assets/images/album.png');
const profileImg = require('../assets/images/profile.png');
const prof2 = require('../assets/images/profile2.png');
const prof3 = require('../assets/images/profile3.png');

const mom = {
      title: "Like This",
      artist: "Atura",
      start: 0.65,
      end: 0.87,
      length: 204,
      album: albumImg,
      waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
    };

  const mom1 = {
    id: "1",
    title: "Golden",
    length: 194,
    start: 0.5,
    end: 0.6,
    artist: "HUNTR/X: EJAE, Audrey Nuna & REI AMI",
    album: require("@/assets/images/album1.jpeg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom2 = {
    id: "2",
    title: "back to friends",
    artist: "sombr",
    length: 199,
    start: 0.6,
    end: 0.7,
    album: require("@/assets/images/album2.jpeg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom3 = {
    id: "3",
    title: "Ordinary",
    artist: "Alex Warren",
    length: 186,
    start: 0.2,
    end: 0.3,
    album: require("@/assets/images/album3.jpeg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom4 = {
    id: "4",
    title: "Man I Need",
    artist: "Olivia Dean",
    length: 184,
    start: 0.25,
    end: 0.35,
    album: require("@/assets/images/album4.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom5 = {
    id: "5",
    title: "TIT FOR TAT",
    artist: "Tate McRae",
    length: 175,
    start: 0.44, 
    end: 0.55,
    album: require("@/assets/images/album5.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom6 = {
    id: "6",
    title: "Don't Say You Love Me",
    length: 180,
    start: 0.2,
    end: 0.35,
    artist: "Jin",
    album: require("@/assets/images/album6.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom7 = {
    id: "7",
    title: "Soda Pop",
    artist: "Saja Boys: Andrew Choi, Neckwav, Danny Chung, Kevin Woo & samUIL Lee",
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
    length: 150,
    start: 0.3,
    end: 0.44,
    album: require("@/assets/images/album7.jpg"),
    
  };
  const mom8 = {
    id: "8",
    title: "Die With A Smile",
    length: 224,
    start: 0.6,
    end: 0.7,
    artist: "Morgan Wallen Featuring Tate McRae",
    album: require("@/assets/images/album8.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom9 = {
    id: "9",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eillish",
    length: 210,
    start: 0.5,
    end: 0.6,
    album: require("@/assets/images/album9.jpg"),
    waveform: [3, 4, 7, 8, 10, 2, 11, 12, 13, 17, 18, 16, 15, 14, 11, 7, 6, 7, 8, 9, 4, 3, 2, 1, 1, 5, 4, 8, 9, 10, 12, 13, 15, 17, 16, 19, 20, 22, 24, 24, 23, 21, 19, 18, 15, 11, 10, 7, 6, 1],
  };
  const mom10 = {
    id: "10",
    title: "Gabriela",
    length: 197,
    start: 0.5,
    end: 0.67,
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

export const demoMoments = [demoMoment, demoMoment2, demoMoment3, demoMoment4, demoMoment5];

export const moments = [mom1, mom2, mom3, mom4, mom5, mom6, mom7, mom8, mom9, mom10];

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
