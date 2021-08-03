const mongoose = require('mongoose');
// db connection
const DB = process.env.DATABASE

mongoose.connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).then(() => console.log(`connection successful`))
    .catch((err) => console.log('No connection ' + err)) 