import express from "express";
import { getUsers, getEvents, getSignUps, insertUser, insertEvent, insertSignUp,deleteUser, deleteEvent, deleteSignUp } from "./db.js"

const app = express();
const port = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => {
    res.send('Server is running!');;
});

//Create API endpoints for funtions

/**
 * Gets users.
 * Provide direction and column in query of request
 * Default value is uid and ASC 
 * @returns Array of users
 */
app.get("/users", async (req, res) => {
    var { direction = 'ASC', column = 'uid' } = req.query;
    direction ||= 'ASC';
    column ||= 'uid';

    const validColumns = ['uid', 'fname', 'lname', 'user_level', 'noshow_count'];
    const validDirections = ['ASC', 'DESC'];

    if (!validColumns.includes(column) || !validDirections.includes(direction)) {
        return res.status(400).send('Invalid Column or Direction');
    }

    try {
        const result = await getUsers(direction, column);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})

/**
 * Gets events.
 * Provide date, time, location in query of request as 
 * 'YYYY-MM-DD' and 'HH:MM:SS' and 'location' if needed
 * @returns Array of events
 */
app.get("/events", async (req, res) => {
    var { date = '', time = '', location = '' } = req.query;

    if (date !== '' && (date.includes(';') || !date.includes('-') || date.length !== 10)) return res.status(400).send('Invalid Date');
    if (time !== '' && (time.includes(';') || !time.includes(':') || time.length !== 8)) return res.status(400).send('Invalid Time');
    if (location !== '' && (location.includes(';') || location.length > 255)) return res.status(400).send('Invalid location');


    try {
        const result = await getEvents(date, time, location);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

})

/**
 * Gets sign-ups.
 * Provide eid and uid in query of request as int if needed
 * @returns Array of sign-ups 
 */
app.get("/sign-ups", async (req, res) => {
    var { uid = '0', eid = '0' } = req.query;
    eid ||= '0';
    uid ||= '0';
    eid = parseInt(eid);
    uid = parseInt(uid);

    if (Number.isNaN(eid)) return res.status(400).send('Invalid Event ID');
    if (Number.isNaN(uid)) return res.status(400).send('Invalid User ID');

    try {
        const result = await getSignUps(uid, eid);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }


})


/**
 * Inserts user.
 * Provide fname, lname, level, and password of user in request body as
 * {fname: '', lname: '', level: '', password: ''}
 * @returns JSON object of new user
 */
app.post("/users", async (req, res) => {
    var { fname, lname, level, password } = req.body;
    level = parseInt(level);

    if (!fname || fname.includes(':') || fname.length > 255) return res.status(400).send('Invalid fname');
    if (!lname || lname.includes(':') || lname.length > 255) return res.status(400).send('Invalid lname');
    //!!! what are valid levels?
    if (Number.isNaN(level)) return res.status(400).send('Invalid level');
    if (password.includes(';') || password.length > 255 || !password) return res.status(400).send('Invalid password');

    try {
        const result = await insertUser(fname, lname, level, password);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 * Inserts event.
 * Provide location, date, time of event in request body as
 * {location: '', date: '', time: ''}
 * @returns JSON object of new event
 */
app.post("/events", async (req, res) => {
    const { location, date, time } = req.body;


    if (!date || date.includes(';') || !date.includes('-') || date.length !== 10) return res.status(400).send('Invalid Date');
    if (!time || time.includes(';') || !time.includes(':') || time.length !== 8) return res.status(400).send('Invalid Time');
    if (!location || location.includes(';') || location.length > 255) return res.status(400).send('Invalid location');


    try {
        const result = await insertEvent(date, time, location);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

});


/**
 * Inserts sign up.
 * Provide uid of user and eid of event in request body as
 * {uid: '', eid: ''}
 * @returns JSON object of new sign up with attendance being false
 */
app.post("/sign-ups", async (req, res) => {
    var { uid, eid } = req.body;
    uid = parseInt(uid);
    eid = parseInt(eid);

    if (Number.isNaN(uid)) return res.status(400).send('Invalid uid');
    if (Number.isNaN(eid)) return res.status(400).send('Invalid eid');

    try {
        const result = await insertSignUp(uid, eid);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})


/**
 * Deletes event.
 * Provide eid of event in request parameter
 * @returns {boolean} True if sucessful delete
 */
app.delete("/events/:eid", async (req, res) => {
    var { eid } = req.params;
    eid = parseInt(eid);

    if (eid === 0 || Number.isNaN(eid)) return res.status(400).send('Invalid event ID');

    try {
        const result = await deleteEvent(eid);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 * Deletes user.
 * Provide uid of user in request parameter
 * @returns {boolean} True if sucessful delete
 */
app.delete("/users/:uid", async (req, res) => {
    var { uid } = req.params;
    uid = parseInt(uid);

    if (uid === 0 || Number.isNaN(uid)) return res.status(400).send('Invalid user ID');

    try {
        const result = await deleteUser(uid);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 * Deletes sign up.
 * Provide uid of user and eid of event in query of request
 * @returns {boolean} True if sucessful delete
 */
app.delete("/sign-ups/", async (req, res) => {
    var { uid, eid } = req.query;
    uid = parseInt(uid);
    eid = parseInt(eid);

    if (uid === 0 || Number.isNaN(uid)) return res.status(400).send('Invalid user ID');
    if (eid === 0 || Number.isNaN(eid)) return res.status(400).send('Invalid event ID');

    try {
        const result = await deleteSignUp(uid);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
