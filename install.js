var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Data_Base.db');

db.serialize(function() {
    db.run('DROP TABLE IF EXISTS Users')
    db.run('DROP TABLE IF EXISTS Posts')

    db.run(`
        CREATE TABLE IF NOT EXISTS Users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pseudo varchar(255),
            email varchar(255),
            password varchar(255)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Posts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_id INTEGER,
            date TEXT,
            content TEXT,
            image_link TEXT,
            tag TEXT,
            score INTEGER,

            FOREIGN KEY (author_id) REFERENCES Users(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Comments(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_id INTEGER,
            post_id INTEGER,
            date TEXT,
            content TEXT,

            FOREIGN KEY (author_id) REFERENCES Users(id),
            FOREIGN KEY (post_id) REFERENCES Posts(id)
        );
    `)

    db.run(`
        CREATE TABLE IF NOT EXISTS Reacts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reactor_id INTEGER,
            post_id INTEGER,
            date TEXT,
            react INTEGER,

            FOREIGN KEY (reactor_id) REFERENCES Users(id),
            FOREIGN KEY (post_id) REFERENCES Posts(id)
        );
    `)

    db.run(`
        INSERT INTO Users(pseudo, email, password)
        VALUES
            ("Abied",   "social@imad-abied.pro",    "eOxzkz2083!;z"),
            ("Ahalli",  "social@med-ahalli.pro",    "s#{la_brute!f"),
            ("Linus",  "linus.torvalds@linux-fondation.org", "a2khSDeu"),
            ("Ronaldo",  "cr7.ronaldo@fifa.com", "mp2Ammrw"),
            ("Ramsay",  "gorden-ramsay@bbc.uk", "bWeP36dJ"),
            ("Biden", "president-biden@gouv.us", "Gt9Hr7BW");
    `);

    db.run(`
        INSERT INTO Posts(author_id, content, image_link, tag, date, score)
        VALUES
            (1,   "Welcome to Teilen", "https://images.twinkl.co.uk/tw1n/image/private/t_630/u/ux/tiger-2535888-1920_ver_1.jpg", "nature", datetime('now', 'localtime', '-2 days'), 0),
            (2,   "PSG vs FCB !", "https://images.bfmtv.com/hWqWgLneICAMGTvbfMPHL2-HXJo=/0x0:1280x720/images/Resume-Barcelone-1-4-Paris-SG-Ligue-des-champions-8e-de-finale-aller-970499.jpg", "dev", datetime('now', 'localtime', '-2 days', '+1 minute'), 0),
            (3,   "I'm in love with this website", "https://www.zdnet.com/a/hub/i/2020/07/13/7c4051fb-df54-4d6e-8bb6-35b9b48ee872/linustorvaldstedyoutubed.jpg", "dev", datetime('now', 'localtime', '-1 days', '+21 minutes', '-5 hours'), 0),
            (4,   "Juventus confirm Ronaldo is in Madeira but not a return date", "https://ronaldo.com/wp-content/uploads/2020/02/GettyImages-1203559908.jpg", "sport", datetime('now', 'localtime', '-1 days', '-43 minutes', '+3 hours'), 0),
            (5,   "Chefs Are Fed Up With Gordon Ramsay’s Cartoonish Bullying", "https://pyxis.nymag.com/v1/imgs/8d7/8d1/a6b94063a43171a380fb9c6b1c4da37f8f-20-gordon-ramsay.rhorizontal.w700.jpg", "cooking", datetime('now', 'localtime', '-16 minutes', '-2 hours'), 0),
            (6,   "Biden Tried to Keep It Boring. This Week Intervened.", "https://static01.nyt.com/images/2021/05/22/us/politics/22onpolitics-newsletter/22onpolitics-newsletter-jumbo.jpg?quality=90&auto=webp", "politics", datetime('now', 'localtime', '-21 minutes'), 0);
    `);

    db.run(`
        INSERT INTO Comments(author_id, post_id, content, date)
        VALUES
            (2, 1, "First comment ever !", "2021-04-27 22:37:31"),
            (1, 2, "Psg is the best !", "2021-05-02 22:44:21"),
            (2, 2, "It a master piece", "2021-05-02 22:45:16");
    `);

    db.run(`
        INSERT INTO Reacts(reactor_id, post_id, react, date)
        VALUES
            (1, 1, 1, "2021-05-16 21:37:22"),
            (2, 1, 0, "2021-05-16 21:38:17"),
            (3, 1, 1, "2021-05-16 21:38:17");
    `);

});

db.close();